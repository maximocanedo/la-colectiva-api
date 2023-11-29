"use strict";

const getJSON = () => ({
    "path": document.si.paths.value,
    "dock": document.si.docks.value,
    "time": `1990-01-01T${document.si.time.value}:00.000Z`
});
const genOpt = (text, value) => {
    let o = document.createElement("option");
    o.innerText = text;
    o.value = value;
    return o;
};
const loadDocks = async () => {
    const docks = await fetch(
        "http://localhost:3000/docks/?q=&prefer=-1&itemsPerPage=400",
        {
            method: "GET"
        }
    );
    if(docks.status === 200) {
        document.si.docks.innerHTML = '';
        const arr = await docks.json();
        arr.map(dock => {
           const opt = genOpt(dock.name, dock._id);
           document.si.docks.append(opt);
        });
    }
};

const loadPaths = async () => {
    const paths = await fetch(
        "http://localhost:3000/paths/",
        {
            method: "GET"
        }
    );
    if(paths.status === 200) {
        document.si.paths.innerHTML = '';
        const arr = await paths.json();
        arr.map(path => {
            const opt = genOpt(path.title, path._id);
            document.si.paths.append(opt);
        });
    }
};

const addSchedule = async () => {
    const res = await fetch(
        "http://localhost:3000/schedules",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(getJSON())
        }
    );
    console.log(res.status);
}

window.load = async () => {

    await loadDocks();
    await loadPaths();
}
(async () => {
    document.querySelector("#btnEnviar").addEventListener("click", (e) => {
        (async () => {
            await addSchedule();
        })();
    });
    await loadDocks();
    await loadPaths();})();