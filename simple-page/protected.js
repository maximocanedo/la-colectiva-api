"use strict";

const access = async () => {
	const sendData = {};
	const apiUrl = "http://localhost:3000/users/protected";
	const requestOptions = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	fetch(apiUrl, requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			// Aquí podés manejar la respuesta del servidor
			//const status = response.status;
			//console.log({ status });
			console.log("Respuesta del servidor:", data);
			document.querySelector("#name").innerText = data.user.name;
			document.querySelector("#status").innerText = data.user.username; //*/
		})
		.catch((error) => {
			console.error("Error en la consulta:", error);
		});
};
