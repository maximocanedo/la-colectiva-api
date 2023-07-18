"use strict";
const Hash = require("./../entity/Hash");
const HashData = require("./../data/HashData");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("./../entity/User");

const generateSalt = () => crypto.randomBytes(32).toString("hex");
const generateSaltPair = () => {
	return [generateSalt(), generateSalt()];
};

const securePassword = (password) => {
	const saltRounds = 10;
	const [saltPrefix, saltSuffix] = generateSaltPair();
	const saltedPassword = saltPrefix + password + saltSuffix;
	return new Promise((resolve, reject) => {
		bcrypt.hash(saltedPassword, saltRounds, function (err, hash) {
			if (err) {
				console.log({ err });
				reject(err);
			}
			console.log({ hash, salt: [saltPrefix, saltSuffix] });
			resolve({ hash, salt: [saltPrefix, saltSuffix] });
		});
	});
};

const verifyPassword = (password, hash, salts) => {
	const [saltPrefix, saltSuffix] = salts;
	const saltedPassword = saltPrefix + password + saltSuffix;

	return new Promise((resolve, reject) => {
		bcrypt.compare(saltedPassword, hash, function (err, result) {
			if (err) {
				console.log({ err });
				reject(err);
			}
			resolve(result);
		});
	});
};

const check = async ({ user, password } = obj, next) => {
	let hash, salt;
	const userObj = new User();
	userObj.username = user;
	const result = HashData.getLast(userObj);
	if (!result.ErrorFound) {
		const record = result.ObjectReturned;
		console.log("checkrecord", { record });
		if (record.length > 0) {
			const finalRow = record[0];
			hash = finalRow[HashData.Columns.hash];
			salt = [
				finalRow[HashData.Columns.salt0],
				finalRow[HashData.Columns.salt1],
			];
			try {
				const isMatch = await verifyPassword(password, hash, salt);

				if (isMatch) {
					return await next({
						errCode: 200,
						msg: "Inicio de sesión exitoso.",
					});
				} else {
					return await next({
						errCode: 403,
						msg: "Credenciales inválidas",
					});
				}
			} catch (err) {
				return await next({
					errCode: 401,
					msg: "Error al comparar las contraseñas",
				});
			}
		} else {
			return await next({
				errCode: 404,
				msg: "Credenciales inválidas",
			});
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
		const { hash, salt } = await securePassword(password);
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
