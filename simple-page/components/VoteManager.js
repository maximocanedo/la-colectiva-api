"use strict";
export default class VoteManager {
    constructor(data, apiURL = "") {
        this.upvotes = data.upvotes;
        this.downvotes = data.downvotes;
        this.getAPIURL = () => apiURL;
        this.queryURL = `${apiURL}/votes`;
    }
    async reload() {
        const queryURL = `${this.getAPIURL()}/votes`;
        const source = await fetch(queryURL, {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        });
        if(source.status === 200) {
            const data = await source.json();
            const e = {upvotes: data.inFavorCount, downvotes: data.againstCount};
            this.reloadButtons(e.upvotes, e.downvotes);
        }
    }
    static async load(apiURL) {
        const queryURL = `${apiURL}/votes`;
        const source = await fetch(queryURL, {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        });
        let vm = new VoteManager({upvotes: -1, downvotes: -1}, apiURL);
        if(source.status === 200) {
            const data = await source.json();
            return new VoteManager({upvotes: data.inFavorCount, downvotes: data.againstCount}, apiURL);
        }
        return vm;
    }
    render() {
        const upVoteBtn = document.createElement("button");
        const downVoteBtn = document.createElement("button");
        this.reloadButtons = (up, down) => {
            this.upvotes = up;
            this.downvotes = down;
            upVoteBtn.innerText = "Up (" + this.upvotes + ")";
            downVoteBtn.innerText = "Down (" + this.downvotes + ")";
        }
        this.reloadButtons(this.upvotes, this.downvotes);
        upVoteBtn.addEventListener('click', async (e) => {
            const action = await fetch(
                `${this.getAPIURL()}/validate`, {
                    method: 'POST'
                }
            );
            if(action.status === 200) {
                await this.reload();
            } else {
                console.log(action.status);
            }
        });
        downVoteBtn.addEventListener('click', async (e) => {
            const action = await fetch(
                `${this.getAPIURL()}/invalidate`, {
                    method: 'POST'
                }
            );
            if(action.status === 200) {
                await this.reload();
            } else {
                console.log(action.status);
            }
        });
        const container = document.createElement("div");
        container.classList.add("votes-container");
        container.append(upVoteBtn, downVoteBtn);
        return container;
    }
}