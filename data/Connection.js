"use strict";
const odbc = require("odbc");
const Response = require("./../entity/Response");

class Connection {
	static get Database() {
		return {
			Neptuno: "Neptuno",
			Libreria: "Libreria",
			Viajes: "Viajes",
			BDSucursales: "BDSucursales",
			Eclair: "Eclair",
		};
	}
	constructor(databaseName) {
		this.Server = "DESKTOP-G2NKNCB\\SQLEXPRESS";
		this.DataBaseName = databaseName;
		this.Response = new Response();
		this.ConnectionString = `Driver={SQL Server};Server=${this.Server};Database=${this.DataBaseName};Trusted_Connection=yes;`;
		console.log({ server: this.Server, da: this.DataBaseName });
	}

	async FetchData(query, parameters = null) {
		try {
			const connection = await odbc.connect(this.ConnectionString);
			const result = await connection.query(query, parameters);
			return new Response({
				Message: result.length,
				ErrorFound: false,
				ObjectReturned: result,
			});
		} catch (ex) {
			return new Response({
				ErrorFound: true,
				Message: "Error al obtener datos de la base de datos.",
				Details: ex.toString(),
				Exception: ex,
				ObjectReturned: JSON.stringify(ex.odbcErrors),
			});
		}
	}
	async RunTransaction(query, parameters = null) {
		try {
			const connection = await odbc.connect(this.ConnectionString);
			const result = await connection.query(query, parameters);
			console.log({ e: 34, result });
			return new Response({
				ErrorFound: false,
				AffectedRows: result.count,
			});
		} catch (ex) {
			return new Response({
				ErrorFound: true,
				Message:
					"Error al realizar la transacción en la base de datos.",
				Details: ex.toString(),
				Exception: ex,
				ObjectReturned: JSON.stringify(ex.odbcErrors),
			});
		}
	}
}
module.exports = Connection;
