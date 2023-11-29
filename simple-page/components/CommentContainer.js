'use strict';
import Comment from './Comment.js';
import * as auth from './Auth.js';
export default class CommentContainer {
    static loggedUser = null;
    constructor(arr, err = null, apiURL = "") {
        // Asumimos que se trata de un array de Comments.
        let rawComments = [...arr];
        let comments = rawComments.map(comment => new Comment(comment, CommentContainer.loggedUser));
        this.getError = () => err;
        this.getComments = () => comments;
        this.getAPIURL = () => apiURL;
        this.length = this.getComments().length;
        this.adapter();
    }
    async reload() {
        CommentContainer.loggedUser = await auth.getNormal();
        const commentsSource = await fetch(
            this.getAPIURL(), {
                method: 'GET'
            }
        );
        if(commentsSource.status === 200) {
            const data = await commentsSource.json();
            const arr = data.comments.map(comment => new Comment(comment, CommentContainer.loggedUser));
            this.fill(arr);
        } else {
            this.showError("Error HTTP " + commentsSource.status + ". ");
        }
    }
    static async load(apiURL) {
        CommentContainer.loggedUser = await auth.getNormal();
        apiURL = `${apiURL}/comments`;
        const commentsSource = await fetch(
            apiURL, {
                method: 'GET'
            }
        );
        let cc = null;
        if(commentsSource.status === 200) {
            const data = await commentsSource.json();
            const arr = data.comments;
            cc = new CommentContainer(arr, null, apiURL);
        } else {
            cc = new CommentContainer([], "Error HTTP " + commentsSource.status + ". ", apiURL);
        }
        return cc;
    }

    adapter() {
        let hidden = false;
        const root = document.createElement("div");
        root.classList.add("comments-container");

        const header = document.createElement("div");
        header.classList.add("comments-container--header");
        header.innerText = "Comentarios · " + this.length;
        this.getHeader = () => header;

        const container = document.createElement("div");
        container.classList.add("comments-container--body");
        this.getContainer = () => container;

        this.clear = () => {
            container.innerHTML = "";
            header.innerText = "Comentarios";
        };
        this.fill = comments => {
            this.clear();
            comments.map(comment => container.append(comment.render()));
            header.innerText = "Comentarios · " + comments.length;
        };
        this.showError = (err) => {
            container.innerText = "Error al obtener los comentarios. \nDetalles: " + err;
        }

        if(this.getError() === null) {
            let comments = this.getComments();
            this.fill(comments);
        } else {
            this.showError(this.getError());
        }

        // TODO Validar acá que el usuario pueda publicar comentarios antes de continuar.
        const footer = document.createElement("footer");
        footer.classList.add("comments-container--footer");
        this.getFooter = () => footer;

        const contentTextArea = document.createElement("textarea");
        this.getContextTextArea = () => contentTextArea;

        const btnPublicar = document.createElement("button");
        btnPublicar.innerText = "Publicar comentario";
        this.getPostButton = () => btnPublicar;


        if(CommentContainer.loggedUser != null)
            footer.append(contentTextArea, btnPublicar);

        root.append(header, container, footer);

        this.collapse = () => {
            hidden = true;
            this.getContainer().style.display = "none";
            this.getFooter().style.display = "none";
        };
        this.expand = () => {
            hidden = false;
            this.getContainer().style.display = "block";
            this.getFooter().style.display = "block";
        };

        header.addEventListener('click', e => {
            if(hidden) this.expand();
            else this.collapse();
        });
        btnPublicar.addEventListener('click', async () => {
            const text = contentTextArea.value;
            const action = await fetch(
                this.getAPIURL(), {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({content: text})
                }
            );
            if(action.status === 200 || action.status === 201) {
                await this.reload();
                contentTextArea.value = "";
            } else {
                console.error("Couldn't post your comment. ");
            }
        });


        this.render = () => root;
    }

}