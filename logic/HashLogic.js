"use strict";
const Hash = require("./../entity/Hash");
const HashData = require("./../data/HashData");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("./../entity/User");

const generateSalt = async () => {
	const saltRounds = 10; // Número de rounds para generar el salt
	const salt = await bcrypt.genSalt(saltRounds);
	console.log("Salt generated: ", { salt });
	return salt;
};

const generateHash = async (password, salt) => {
	console.log(32, { password, salt });
	const hash = await bcrypt.hash(password, salt);
	console.log("Hash generated: ", { hash, password, salt });
	return hash;
};

const securePassword = async (plainPassword) => {
	// Generar el salt
	const salt = await generateSalt();

	// Generar el hash usando la contraseña y el salt
	const hashedPassword = await generateHash(plainPassword, salt);
	console.log({ hashedPassword, salt });
	return { hash: hashedPassword, salt };
};

async function validatePassword(enteredPassword, hashedPassword) {
	const isValid = await bcrypt.compare(enteredPassword, hashedPassword);
	return isValid;
}

const verifyPassword = async (enteredPassword, hashedPassword) => {
	return await validatePassword(enteredPassword, hashedPassword);
};

const check = async ({ user, password } = obj, next, token_ok, token_err) => {
	let hash, salt;
	const userObj = new User();
	userObj.username = user;
	const result = await HashData.getLast(userObj);
	if (!result.ErrorFound) {
		const record = result.ObjectReturned;
		if (typeof record != "undefined" && record.length > 0) {
			const finalRow = record[0];
			hash = finalRow[HashData.Columns.hash];
			salt = [
				finalRow[HashData.Columns.salt0],
				finalRow[HashData.Columns.salt1],
			];
			try {
				const isMatch = await verifyPassword(password, hash, salt);
				console.log("Acá llega", { isMatch });
				if (isMatch) {
					console.log("OK 200!", { isMatch });
					let e = await next(
						{
							errCode: 200,
							msg: "Inicio de sesión exitoso.",
							username: user,
						},
						token_ok,
						token_err
					);
					return;
				} else {
					console.log("NO 403!", { isMatch });
					return await next(
						{
							errCode: 403,
							msg: "Credenciales inválidas",
						},
						token_ok,
						token_err
					);
				}
			} catch (err) {
				console.error(err);
				console.log("NO 401!");
				return await next(
					{
						errCode: 401,
						msg: "Error al comparar las contraseñas",
					},
					token_ok,
					token_err
				);
			}
		} else {
			console.log("NO 404!");
			return await next(
				{
					errCode: 404,
					msg: "Credenciales inválidas",
				},
				token_ok,
				token_err
			);
		}
	}
};

const disableAll = async (username) => {
	return {
		result: true,
	};
	let user = new User();
	user.username = username;
	let result = HashData.revokeAll(user);
	console.log({ UNABLING: result });
	return {
		result: !result.ErrorFound,
	};
};

const createPassword = async (username, password) => {
	let userObj = new User();
	userObj.username = username;

	let VerificationsResult = {
		res: false,
		err: "La contraseña ingresada no es válida. ",
	};
	let CleaningResult = {
		res: false,
		err: "Hubo un error al intentar inhabilitar las contraseñas anteriores. ",
	};
	let CryptingResult = {
		res: false,
		err: "Hubo un error al intentar encriptar la contraseña. ",
	};
	let InsertResult = {
		res: false,
		err: "Hubo un error al intentar guardar la contraseña. ",
	};

	let checkPassword = (x) => /^[^\s]{8,24}$/.test(x);

	VerificationsResult.res = checkPassword(password);

	try {
		console.log("Hasta acá llega. ", { password });
		const { hash, salt } = await securePassword(password);
		console.log({ hash, salt });
		// Cancelamos todos los hashes previos (De haber)
		let _unabling = await disableAll(username);
		CleaningResult.res = _unabling.result;

		// Agregamos el hash y el salt a la base de datos
		CryptingResult.res = true;
		let hashObj = new Hash({
			user: userObj,
			hash,
			salt,
		});
		let result = await HashData.add(hashObj);
		InsertResult.res = !result.ErrorFound;
	} catch (error) {
		CryptingResult.res = false;
	}
	let verifications = [
		VerificationsResult,
		CleaningResult,
		CryptingResult,
		InsertResult,
	];

	let SummaryResult = verifications.every((verification) => {
		return verification.res == true;
	});
	let errors = verifications
		.filter((verification) => !verification.res)
		.map((verification) => verification.err);

	return {
		result: SummaryResult,
		errors,
	};
};

module.exports = { createPassword, disableAll, check };
