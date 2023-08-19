"use strict";

const login = async () => {
	const apiUrl = "/users/login";

	const usernameInput = document.querySelector("#username-input").value;
	const passwordInput = document.querySelector("#password-input").value;

	const loginData = {
		username: usernameInput,
		password: passwordInput,
	};

	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(loginData),
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
			document.querySelector("#status").innerText = data.message;
		})
		.catch((error) => {
			console.error("Error en la consulta:", error);
		});
};
