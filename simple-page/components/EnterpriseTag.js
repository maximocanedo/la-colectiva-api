"use strict";
export default class EnterpriseTag {
    constructor(data) {
        this.getData = () => data;
    }
    static path = "/test/test/enterprise/details"
    render() {
        const data = this.getData();
        const a = document.createElement("a");
        a.href = `${EnterpriseTag.path}?id=${data._id}`;
        a.innerText = data.name;
        return a;
    }
}