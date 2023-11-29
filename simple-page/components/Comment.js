"use strict";
import UnimplementedMethodException from "./exceptions/UnImplementedMethodException.js";
import * as auth from "./Auth.js";
export default class Comment {
    constructor(data, loggedUser) {
        let content = data.content ?? "";
        let user = data.user?? { _id: "", name: "Usuario"};
        this.isModifiable = () => loggedUser != null && loggedUser._id === data.user._id;
        let _id = data._id ?? "";
        let uploadDate = data.uploadDate?? new Date().toISOString();
        uploadDate = new Date(uploadDate);
        let active = data.active ?? false;
        this.getContent = () => content;
        this.getUser = () => user;
        this.getId = () => _id;
        this.getUploadDate = () => uploadDate;
        this.isActive = () => active;
        this.getVersion = () => data.__v;
    }
    async delete() {
        if(!confirm("¿Seguro de eliminar este comentario?")) return;
        const result = await fetch(`http://localhost:3000/comments/${this.getId()}`, {
            method: "DELETE"
        });
        if(result.status === 200) {
            console.log("Comment deleted. ");
            this.getContainer().remove();
        } else {
            console.log("No se eliminó el comentario. ");
        }

    }
    async edit() {
        let newValue = prompt("Editar comentario", this.getContent());
        const result = await fetch(`http://localhost:3000/comments/${this.getId()}`, {
           method: 'PUT',
            headers: {
               'Content-Type': "application/json"
            },
           body: JSON.stringify({content: newValue})
        });
        if(result.status === 200 || result.status === 201) {
            console.log("Comentario editado correctamente. ");
            const data = await result.json();
            this.getVersion = () => data.__v;
            this.getContent = () => data.content;
            this.getUploadTag().innerText = " " + this.getUploadDate().toLocaleString();
            if(data.__v > 0) this.getUploadTag().innerText += " (Editado)";
            this.setContent(data.content);

        } else {
            console.log("El comentario no se editó. ");
        }
    }

    render() {
        const container = document.createElement("div");
        container.classList.add("comment");
        this.getContainer = () => container;
        const header = document.createElement("div");
        header.classList.add("comment-header");
        const userTag = document.createElement("a");
        userTag.innerText = this.getUser().name;
        userTag.href = "#" + this.getUser()._id;
        const uploadTag = document.createElement("i");
        this.getUploadTag = () => uploadTag;
        uploadTag.innerText = " " + this.getUploadDate().toLocaleString();
        if(this.getVersion() > 0) uploadTag.innerText += " (Editado)";
        const editButton = document.createElement("button");
        editButton.innerText = "Editar";
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Eliminar";
        const content = document.createElement("p");
        content.classList.add("comment-content");
        content.innerText = this.getContent();
        this.setContent = c => content.innerText = c;
        header.append(userTag, uploadTag);
        container.append(header, content);
        if(this.isModifiable()) container.append(editButton, deleteButton);
        editButton.addEventListener("click", async (e) => {
            await this.edit();
        });
        deleteButton.addEventListener("click", async (e) => {
            await this.delete();
        });
        return container;
    }
}