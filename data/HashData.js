"use strict";
const Hash = require("../entity/Hash");
const Connection = require("./Connection");

const hsh = {
	Columns: {
		user: "Usuario",
		hash: "Hash",
		salt0: "SaltInicial",
		salt1: "SaltFinal",
		created: "FechaCreacion",
		status: "Activo",
	},
	Table: "Hashes",
};

const revokeAll = async (user) => {
	const query = `UPDATE [${hsh.Table}] SET [${hsh.Columns.status}] = 0 WHERE [${hsh.Columns.user}] = ?`;
	const parameters = [user.username];
	console.log("revokeall", { query, parameters });
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.RunTransaction(query, parameters);
		console.log({ response, query, parameters });
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};
const add = async (hash) => {
	const query = `EXEC Hashes__Add @USUARIO = ?, @HASH = ?, @SALT0 = ?, @SALT1 = ?`;
	const parameters = [
		hash.user.username,
		hash.hash,
		hash.salt[0],
		hash.salt[1],
	];
	try {
		const con = new Connection(Connection.Database.Colectiva);
		const response = await con.RunTransaction(query, parameters);
		console.log({ response, query, parameters });
		return response;
	} catch (err) {
		console.error(err);
		return {
			ErrorFound: true,
		};
	}
};
const getLast = async (user) => {
	const query = `SELECT TOP(1) * FROM [${hsh.Table}] WHERE [${hsh.Columns.user}] = ? AND [${hsh.Columns.status}] = 1`;
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
const listByUser = async (user) => {
	const query = `SELECT * FROM [${hsh.Table}] WHERE [${hsh.Columns.user}] = ?`;
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

module.exports = { ...hsh, add, getLast, listByUser, revokeAll };
