"use strict";

import WaterBodyPage from "../../../components/WaterBodyPage.js";

(async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const page = await WaterBodyPage.load(id);
    console.log(page);
    document.querySelector("#root").append(page.render());


})()