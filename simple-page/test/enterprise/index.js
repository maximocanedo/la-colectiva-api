"use strict";
import EnterpriseList from "../../components/EnterpriseList.js";
(async () => {
    const list = await EnterpriseList.load();
    document.querySelector("#root").append(list.render());
})();