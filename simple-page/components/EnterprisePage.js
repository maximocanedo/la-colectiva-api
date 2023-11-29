"use strict";
import CommentContainer from "./CommentContainer.js";
import VoteManager from "./VoteManager.js";

export default class EnterprisePage {
    constructor(data, error = null, APIURL = "") {
        this.getData = () => data;
        this.getId = () => data._id?? "";
        this.getError = () => error;
        this.getAPIURL = () => APIURL;
    }
    static async load(id) {
        const APIURL = `http://localhost:3000/enterprises/${id}`;
        this.getAPIURL = () => APIURL;
        const source = await fetch(this.getAPIURL(), {
            method: "GET",
            headers: {
                'Content-Type': "application/json"
            }
        });
        let ep = new EnterprisePage({}, "Error. " + source.status + ". ", APIURL);
        if(source.status === 200) {
            const data = await source.json();
            const el = new EnterprisePage(data, null, APIURL);
            await el.initAsyncData();
            return el;
        } else return ep;
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
        const container = document.createElement("div");
        container.classList.add("enterprise-page");

        if(this.getError() !== null) {
            container.innerText = this.getError();
            return container;
        }

        const title = document.createElement("h1");
        title.innerText = data.name;
        const cuit = document.createElement("h3");
        cuit.innerText = "CUIT No. " + data.cuit;
        const descr = document.createElement("p");
        descr.innerText = data.description;
        const ff = document.createElement("i");
        ff.innerText = data.foundationDate.toLocaleString();

        const listTitle = document.createElement("span");
        listTitle.innerText = "\n\nTeléfonos: ";
        const list = document.createElement("ul");
        (data.phones?? []).map(phone => {
            const item = document.createElement("li");
            item.innerText = phone;
            list.append(item);
        });

        container.append(title, cuit, descr, ff, listTitle, list);

        if(this.votesSection != null) container.append(this.votesSection.render());
        if(this.commentsSection != null) container.append(this.commentsSection.render());

        return container;
    }
}