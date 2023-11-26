"use strict";

const getJSON = () => ({
    "name": document.cm.name.value,
    "address": document.cm.address.value,
    "region": document.querySelector('#region').value,
    "notes": document.cm.notes.value,
    "status": parseInt(document.cm.status.value),
    "latitude": document.cm.lat.value,
    "longitude": document.cm.lon.value
});

const fillRegion = async () => {
    document.querySelector("#env").addEventListener('click', async (e) => {
        await submit();
    });
  const genOpt = (text, value) => {
      let o = document.createElement("option");
      o.innerText = text;
      o.value = value;
      return o;
  };
    document.querySelector('#region').innerHTML = '';
  const f = await fetch(
      "http://localhost:3000/waterBodies/",
      { method: "GET" }
  );
  if(f.status == 200) {
      const json = await f.json();
      json.map(region => {
          let op = genOpt(region.name, region._id);
          document.querySelector('#region').append(op);
      })
  }
};

const submit = async () => {
    const e = fetch(
        "http://localhost:3000/docks/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(getJSON())
        }
    );
    console.log(e);
    console.log(e.status);
};

