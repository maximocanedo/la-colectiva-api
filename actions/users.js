"use strict";
const User = require("./../entity/User");
const UserLogic = require("./../logic/UserLogic");
const HashLogic = require("./../logic/HashLogic");
const { rawLogin } = require("./../actions/sessions");

const getUserByUsername = async (req, res) => {
	let username = req.params.username;
	let user_logic = new UserLogic();
	let y = await user_logic.getByUsername(username);
	res.json(user_logic.user);
};

const createUser = async (req, res) => {
	try {
		const newUser = createUserObject(req);
		const userRecord = await addUser(newUser);
		const { EtapaUsuario, StatusCode, LoginDetails, InicioSesion } =
			await processUser(userRecord, req.query.password);
		const hashRecord = await createHash(
			newUser.username,
			req.query.password
		);

		res.status(StatusCode).json({
			UserRecord: userRecord,
			HashRecord: hashRecord,
			LoginDetails,
			InicioSesion,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createUserObject = (req) => {
	const { username, name, surname, birthdate, sex } = req.query;
	return new User({
		username,
		name,
		surname,
		birthdate: new Date(birthdate),
		sex,
	});
};

const addUser = async (user) => {
	const userLogic = new UserLogic();
	return await userLogic.AddUser(user);
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

const createHash = async (username, password) => {
	const newHash = new HashLogic();
	return await newHash.CreatePassword(username, password);
};

const viewMyUser = async (req, res) => {
	let username = req.user.username;
	let user_logic = new UserLogic();
	let y = await user_logic.getByUsername(username);
	res.json(user_logic.user);
};

const changePassword = async (req, res) => {
	let username = req.user.username;
	let password = req.query.password;
	let hl = new HashLogic();
	let result = await hl.CreatePassword(username, password);
	let finalResult = result.SummaryResult;
	res.status(finalResult ? 200 : 500).json(result);
};

module.exports = { getUserByUsername, createUser, viewMyUser, changePassword };
