"use strict";
export default class WaterBodyTag {
    constructor(data) {
        this.getData = () => data;
    }
    static rootPath = "/test/test/waterbody/details";
    static getNames() {
        return [
            "Río", "Arroyo", "Riachuelo", "Canal", "Lago", "Estanque", "Laguna", "Embalse", "Pantano",
            "Pozo", "Acuífero", "Bahía", "Golfo", "Mar", "Océano"
        ];
    }
    render() {
        const data = this.getData();
        const a = document.createElement("a");
        a.setAttribute("href", `${WaterBodyTag.rootPath}?id=${data._id}`);
        a.innerText = `${WaterBodyTag.getNames()[data.type]} ${data.name}`;
        return a;
    }
}