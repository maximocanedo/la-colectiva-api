"use strict";
const Session = require("../entity/Session");
const Connection = require("./Connection");

const sn = {
	Columns: {
		id: "Id",
		user: "Usuario",
		status: "Activo",
	},
	Table: "Sesiones",
};

const insert = async (user) => {
	const query = `EXEC Sesiones__Iniciar ?`;
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
const getStatus = async (id) => {
	const query = `SELECT * FROM Sesiones WHERE [${sn.Columns.id}] = ?`;
	const parameters = [id];
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
const getAll = async (user) => {
	const query = `SELECT * FROM Sesiones WHERE [${sn.Columns.user}] = ?`;
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
const disable = async (id) => {
	const query = `UPDATE [${sn.Table}] SET [${sn.Columns.status}] = 0 WHERE [${sn.Columns.id}] = ?`;
	const parameters = [id];
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

module.exports = { insert, getStatus, getAll, disable };
