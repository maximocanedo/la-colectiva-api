"use strict";
const Response = require("./../entity/Response");
const Connection = require("./../data/Connection");
const Token = require("./../entity/Token");

class TokenLogic {
	constructor(token = new Token()) {
		let _ = {
			token,
			...this,
			Columns: {
				token: "Token",
				active: "Activo",
				created: "EmitidoEl",
			},
			Table: "Tokens",
		};
		Object.assign(this, _);
	}
	async Insert(token, active = true, date = null) {
		let activeAsBit = active ? 1 : 0;
		let cn = new Connection(Connection.Database.Eclair);
		let result = cn.Response.ErrorFound
			? cn.Response
			: await cn.RunTransaction(
					`INSERT INTO [${this.Table}] ([${this.Columns.token}], [${this.Columns.active}], [${this.Columns.created}]) SELECT '${token}', '${activeAsBit}', '${date}'`
			  );
		console.log({ result });
		if (!result.ErrorFound && result.AffectedRows == 1) {
			console.log(101);
			return {
				result: true,
			};
		} else {
			console.log(105);
			return {
				result: false,
			};
		}
	}
	async IsActive(token) {
		let cn = new Connection(Connection.Database.Eclair);
		let result = cn.Response.ErrorFound
			? cn.Response
			: await cn.FetchData(
					`SELECT [${this.Columns.active}] FROM [${this.Table}] WHERE [${this.Columns.token}] = '${token}' AND [${this.Columns.active}] = '1'`
			  );
		if (!result.ErrorFound) {
			let data = result.ObjectReturned;
			return data.length > 0;
		}
		return false;
	}
	async Deactivate(token) {
		let cn = new Connection(Connection.Database.Eclair);
		let result = cn.Response.ErrorFound
			? cn.Response
			: await cn.RunTransaction(
					`UPDATE [${this.Table}] SET [${this.Columns.active}] = 0 WHERE [${this.Columns.token}] = '${token}'`
			  );
		console.log({ result });
		if (!result.ErrorFound && result.AffectedRows == 1) {
			return {
				result: true,
			};
		} else {
			return {
				result: false,
			};
		}
	}
}
module.exports = TokenLogic;
