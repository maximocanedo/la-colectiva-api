"use strict";
import CommentContainer from "./CommentContainer.js";
import VoteManager from "./VoteManager.js";
export default class WaterBodyPage {
    constructor(data, err = null) {
        this.getData = () => data;
        this.getFullName = () => {
            const arr = WaterBodyPage.getNames();
            return `${arr[this.getData().type]} ${this.getData().name}`;
        };
        this.getId = () => data._id?? null;
        this.getAPIURL = () => `http://localhost:3000/waterBodies/${this.getId()}`;
        this.getError = () => err;
    }
    static getNames() {
        return [
            "Río", "Arroyo", "Riachuelo", "Canal", "Lago", "Estanque", "Laguna", "Embalse", "Pantano",
            "Pozo", "Acuífero", "Bahía", "Golfo", "Mar", "Océano"
        ];
    }
    static async load(id) {
        const apiURL = `http://localhost:3000/waterBodies/${id}`;
        const source = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        });
        if(source.status === 200) {
            const data = await source.json();
            let obj = new WaterBodyPage(data, null);
            await obj.initAsyncData();
            return obj;
        } else return new WaterBodyPage({}, "Error " + source.status + ". ");
    }
    async renderComments() {
        if(this.getId() === null) return;
        const commentContainer = await CommentContainer.load(this.getAPIURL());
        return commentContainer;
    }
    async renderVotes() {
        if(this.getId() === null) return;
        const votesManager = await VoteManager.load(this.getAPIURL());
        return votesManager;
    }
    async initAsyncData() {
        try {
            const [comments, votes] = await Promise.all([
                this.renderComments(),
                this.renderVotes()
            ]);

            this.commentsSection = comments;
            this.votesSection = votes;
        } catch (error) {
            console.error("Error occurred while fetching comments or votes:", error);
        }
    }
    render() {
        const data = this.getData();
        const root = document.createElement("div");
        root.classList.add("waterbody-page");
        const title = document.createElement("h1");
        title.innerText = this.getFullName();
        root.append(title, this.votesSection.render(), this.commentsSection.render());


        return root;

    }
}