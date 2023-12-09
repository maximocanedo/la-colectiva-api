"use strict";

const signup = async () => {
	const apiUrl = "http://localhost:3000/users/signup";

	const usernameInput = document.querySelector("#username").value;
	const nameInput = document.querySelector("#name").value;
	const ageInput = document.querySelector("#age").value;
	const mailInput = document.querySelector("#mail").value;
	const prebirthInput = document.querySelector("#birth").value;
	const birthDate = new Date(prebirthInput);
	const birthInput = birthDate.toJSON();
	const passwordInput = document.querySelector("#password").value;

	const ldata = {
		username: usernameInput,
		name: nameInput,
		age: ageInput,
		email: mailInput,
		birth: birthInput,
		password: passwordInput,
	};

	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(ldata),
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
