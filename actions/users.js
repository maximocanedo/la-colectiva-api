"use strict";
const User = require("./../entity/User");
const UserLogic = require("./../logic/UserLogic");
const HashLogic = require("./../logic/HashLogic");
const { rawLogin } = require("./../actions/sessions");
const { ValidationError } = require("./../errors/errors");
const { RequestSet, ValidationTemplate } = require("./../logic/RequestSet");

// Action: Obtener datos de un usuario en particular.
const getUserByUsername = async (req, res) => {
	let username = req.params.username;
	let y = await UserLogic.getByUsername(username);
	res.json(y);
};

const createUser__Validated = async (req, res) => {
	try {
		const newUserObj = createUserObject(req, res);
		if (newUserObj.error) {
			res.status(400).json({
				error: newUserObj.error,
				details: newUserObj.msg,
			});
			return;
		}
		const newUser = newUserObj.user;
		const userRecord = await UserLogic.add(newUser);
		const { StatusCode, LoginDetails, InicioSesion } = await processUser(
			userRecord,
			req.body.password
		);
		const hashRecord = await createHash(
			newUser.username,
			req.body.password
		);
		res.status(StatusCode).json({
			user: userRecord,
			password: hashRecord,
			LoginDetails,
			InicioSesion,
		});
	} catch (error) {
		res.status(500).json({ err: { ...error }, msg: error.message });
	}
};
// Action: Crear un usuario.
const createUser = async (req, res) => {
	const parametersAccepted = new RequestSet(
		[
			ValidationTemplate.username,
			ValidationTemplate.name,
			ValidationTemplate.surname,
			ValidationTemplate.birthdate,
			ValidationTemplate.password,
			ValidationTemplate.role,
		],
		{ req, res },
		req.body
	);
	parametersAccepted.validate(createUser__Validated, (req, res, errors) => {
		res.status(400).json(errors);
	});
};

const createUserObject = (req, res) => {
	const { username, name, surname, bio, role, birthdate, password } =
		req.body;
	const mustHave = [username, name, surname, role, birthdate, password];
	const optional = [bio];
	const verificationsPassed = mustHave.every(
		(item) => item != null && item != ""
	);
	if (!verificationsPassed) {
		return {
			error: true,
			user: null,
			msg: "Faltan parámetros necesarios o no están en el formato correcto. ",
		};
		//throw new ValidationError("Faltan parámetros necesarios. ");
	}
	const user = new User({
		username,
		name,
		surname,
		bio,
		birthdate: new Date(birthdate),
		role,
	});
	return {
		error: false,
		msg: "",
		user,
	};
};

const processUser = async (userRecord, password) => {
	if (!userRecord.VerificationsResult || !userRecord.InsertResult) {
		return { EtapaUsuario: false, StatusCode: 500 };
	}

	const hashRecord = await createHash(userRecord.username, password);

	if (!hashRecord.SummaryResult) {
		return { EtapaUsuario: true, StatusCode: 500 };
	}

	const loginResult = await rawLogin(userRecord.username, password);
	const StatusCode = loginResult.status;
	const LoginDetails = loginResult.json;
	const InicioSesion = StatusCode === 200;

	return { EtapaUsuario: true, StatusCode, LoginDetails, InicioSesion };
};

const createHash = async (username, password) =>
	await HashLogic.createPassword(username, password);

const viewMyUser = async (req, res) => {
	let username = req.user.username;
	let y = await UserLogic.getByUsername(username);
	res.json(y);
};

const changePassword = async (req, res) => {
	let username = req.user.username;
	let password = req.query.password;
	let result = await HashLogic.createPassword(username, password);
	let finalResult = result.SummaryResult;
	res.status(finalResult ? 200 : 500).json(result);
};

module.exports = { getUserByUsername, createUser, viewMyUser, changePassword };
