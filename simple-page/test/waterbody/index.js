"use strict";
import WaterBodyList from "../../components/WaterBodyList.js";

(async () => {
    const list = await WaterBodyList.load();
    document.querySelector("#root").append(list.render());
})();