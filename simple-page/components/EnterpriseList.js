"use strict";
import EnterpriseTag from "./EnterpriseTag.js";
export default class EnterpriseList {
    constructor() {
        this.list = [];
    }
    async init() {
        const source = await fetch("http://localhost:3000/enterprises/", {
            method: 'GET',
            headers: {
                'Content-Type': "application/json"
            }
        });
        if(source.status === 200) {
            this.list = await source.json();
        }
    }
    static async load() {
        const wbl = new EnterpriseList();
        await wbl.init();
        return wbl;
    }
    render() {
        const ul = document.createElement("ul");
        ul.classList.add("enterprise-list");
        this.list.map(el => {
            const li = document.createElement("li");
            const tag = new EnterpriseTag(el);
            li.append(tag.render());
            ul.append(li);
        });
        return ul;
    }
}