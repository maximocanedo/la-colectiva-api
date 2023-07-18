"use strict";
const Connection = require("./Connection");
const User = require("./../entity/User");
const utilities = require("./../logic/utilities");
const { ConnectionError } = require("./../errors/errors");

const Usuario = {
	Columns: {
		username: "NombreDeUsuario",
		name: "Nombre",
		surname: "Apellido",
		bio: "Biografia",
		birthdate: "FechaNacimiento",
		role: "TipoUsuario",
		status: "Estado",
	},
	Table: "Usuarios",
};
const ALL_COLUMNS = `[${Usuario.Columns.username}], [${Usuario.Columns.name}], [${Usuario.Columns.surname}], [${Usuario.Columns.bio}], [${Usuario.Columns.birthdate}], [${Usuario.Columns.role}], [${Usuario.Columns.status}]`;

const getByUsername = async (username) => {
	const query = `SELECT ${ALL_COLUMNS} FROM [${Usuario.Table}] WHERE [${Usuario.Columns.username}] = ?`;
	const parameters = [username];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.FetchData(query, parameters);
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};
const getAll = async () => {
	const query = `SELECT ${ALL_COLUMNS} FROM [${Usuario.Table}]`;
	const parameters = [];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.FetchData(query, parameters);
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};
const add = async (user) => {
	let query = `INSERT INTO [${Usuario.Table}] (${ALL_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`;
	let parameters = [
		user.username,
		user.name,
		user.surname,
		user.bio,
		utilities.formatDateForSQL(user.birthdate, true),
		user.role,
		true,
	];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.RunTransaction(query, parameters);
		return response;
	} catch (err) {
		return {
			ErrorFound: true,
			Exception: err,
		};
	}
};
const modify = async (user) => {
	const query = `UPDATE [${Usuario.Table}] SET [${Usuario.Columns.name}] = ?, [${Usuario.Columns.surname}] = ?, [${Usuario.Columns.bio}] = ?, [${Usuario.Columns.birthdate}] = ?, [${Usuario.Columns.role}] = ?, [${Usuario.Columns.status}] = ? WHERE [${Usuario.Columns.username}] = ?`;
	const parameters = [
		user.name,
		user.surname,
		user.bio,
		user.birthdate,
		user.role,
		user.status,
		user.username,
	];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.FetchData(query, parameters);
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
			Exception: err,
		};
	}
};
const disable = async (user) => {
	const query = `UPDATE [${Usuario.Table}] SET [${Usuario.Columns.status}] = 0 WHERE [${Usuario.Columns.username}] = ?`;
	const parameters = [user.username];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.FetchData(query, parameters);
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};
const enable = async (user) => {
	const query = `UPDATE [${Usuario.Table}] SET [${Usuario.Columns.status}] = 1 WHERE [${Usuario.Columns.username}] = ?`;
	const parameters = [user.username];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.FetchData(query, parameters);
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};

module.exports = {
	add,
	modify,
	disable,
	enable,
	getAll,
	getByUsername,
};
