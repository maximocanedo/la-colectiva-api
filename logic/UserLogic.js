"use strict";
const User = require("./../entity/User");
const UserData = require("./../data/UserData");
const utilities = require("./../logic/utilities");

const setFromRecordSet = (obj) => {
	let newObj = new User();
	newObj.username = obj[this.Columns.username];
	newObj.name = obj[this.Columns.name];
	newObj.surname = obj[this.Columns.surname];
	newObj.bio = obj[this.Columns.surname];
	newObj.birthdate = obj[this.Columns.birthdate];
	newObj.sex = obj[this.Columns.sex];
	newObj.active = obj[this.Columns.active];
	return newObj;
};

const getByUsername = async (username) => {
	let data = UserData.getByUsername(username);
	if (data.ErrorFound == false) {
		const result = data.ObjectReturned;
		if (result.length > 0) {
			const res = result[0];
			const user = setFromRecordSet(res);
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

const verifyUsernameAvailability = async (username) => {
	const data = await getByUsername(username);
	return {
		res: data.Code === 404,
		err: "El nombre de usuario ya existe",
	};
};

const verifyUsernameWriting = (username) => {
	const regex = /^[a-zA-Z0-9_-]{3,24}$/;
	return {
		res: regex.test(username),
		err: "El nombre de usuario no cumple con las reglas.",
	};
};

const verifyName = (name) => {
	const regex = /^[\p{L}\p{M}\s'-]{3,48}$/u;
	return {
		res: regex.test(name),
		err: "El nombre ingresado no cumple con las reglas.",
	};
};

const verifySurname = (surname) => {
	const regex = /^[\p{L}\p{M}\s'-]{3,48}$/u;
	return {
		res: regex.test(surname),
		err: "El apellido ingresado no cumple con las reglas.",
	};
};

const verifySex = (sex) => {
	return {
		res: sex === "M" || sex === "F",
		err: "El valor ingresado para 'Sexo' no es correcto.",
	};
};

const add = async (user) => {
	const usernameAvailability = await verifyUsernameAvailability(
		user.username
	);
	const usernameWriting = verifyUsernameWriting(user.username);
	const nameCheck = verifyName(user.name);
	const surnameCheck = verifySurname(user.surname);
	const sexCheck = verifySex(user.sex);

	const verifications = [
		usernameAvailability,
		usernameWriting,
		nameCheck,
		surnameCheck,
		sexCheck,
	];

	const errors = verifications
		.filter((verification) => !verification.res)
		.map((verification) => verification.err);

	const allVerificationsPassed = verifications.every(
		(verification) => verification.res
	);

	let insertResult = false;
	if (allVerificationsPassed) {
		const formattedDate = utilities.formatDateForSQL(user.birthdate);
		const result = UserData.add(user);
		console.log({ result });
		insertResult = !result.ErrorFound && result.AffectedRows == 1;
	}

	return {
		verificationsPassed: allVerificationsPassed,
		insertResult,
		errors,
	};
};

module.exports = { add, getByUsername, setFromRecordSet };
