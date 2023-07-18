"use strict";
const User = require("./../entity/User");
const UserData = require("./../data/UserData");

const setFromRecordSet = (obj) => {
	let newObj = new User();
	newObj.username = obj[this.Columns.username];
	newObj.name = obj[this.Columns.name];
	newObj.surname = obj[this.Columns.surname];
	newObj.bio = obj[this.Columns.surname];
	newObj.birthdate = obj[this.Columns.birthdate];
	newObj.active = obj[this.Columns.active];
	return newObj;
};

const getByUsername = async (username) => {
	let data = UserData.getByUsername(username);
	if (data.ErrorFound == false) {
		const result = data.ObjectReturned;
		if (result.count > 0) {
			const res = result[0];
			console.log("const res (23)", res);
			const user = setFromRecordSet(res);
			console.log("const user (26)", user);
			return {
				ErrorFound: false,
				ObjectReturned: user,
				Code: 200,
			};
		} else {
			return {
				ErrorFound: true,
				Message: "User not found",
				Code: 404,
			};
		}
	}
	return data;
};

const verify = {
	usernameAvailability: async (username) => {
		const data = await getByUsername(username);
		console.log(45, { data });
		if (data.ObjectReturned != null && data.ObjectReturned.count == 0)
			return {
				res: true,
				err: "El nombre de usuario no existe. ",
			};
		else
			return {
				res: false,
				err: "El nombre de usuario está en uso. ",
			};
	},
	username: (username) => {
		const regex = /^[a-zA-Z0-9_-]{3,24}$/;
		if (!regex.test(username)) {
			return {
				res: false,
				err: "El nombre de usuario ingresado no cumple con las reglas.",
			};
		}
		return {
			res: true,
			err: "",
		};
	},
	name: (name) => {
		const regex = /^[\p{L}\p{M}\s'-]{3,48}$/u;
		if (!regex.test(name)) {
			return {
				res: false,
				err: "El nombre ingresado no cumple con las reglas.",
			};
		}
		return {
			res: true,
			err: "",
		};
	},
	surname: (surname) => {
		const regex = /^[\p{L}\p{M}\s'-]{3,48}$/u;
		if (!regex.test(surname)) {
			return {
				res: false,
				err: "El apellido ingresado no cumple con las reglas.",
			};
		}
		return {
			res: true,
			err: "",
		};
	},
};

// Verifica los datos y añade un registro a la tabla Usuarios.
const add = async (user) => {
	const verifications = [
		await verify.usernameAvailability(user.username),
		verify.username(user.username),
		verify.name(user.name),
		verify.surname(user.surname),
	];

	const errors = verifications
		.filter((verification) => !verification.res)
		.map((verification) => verification.err);

	const allVerificationsPassed = verifications.every(
		(verification) => verification.res
	);

	let insertResult = false;
	if (allVerificationsPassed) {
		const result = await UserData.add(user);
		insertResult = !result.ErrorFound && result.AffectedRows == 1;
		if (!insertResult) {
			errors.push(result.Exception);
		}
	}

	const finalResult = [allVerificationsPassed, insertResult].every(
		(verification) => verification
	);

	return {
		result: finalResult,
		errors,
	};
};

module.exports = { add, getByUsername, setFromRecordSet };
