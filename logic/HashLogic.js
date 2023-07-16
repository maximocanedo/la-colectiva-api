"use strict";
const Connection = require("./../data/Connection");
const Hash = require("./../entity/Hash");
const bcrypt = require("bcrypt");

function securePassword(password) {
	const saltRounds = 10;
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(saltRounds, function (err, salt) {
			if (err) {
				console.log({ err });
				reject(err);
			}
			bcrypt.hash(password, salt, function (err, hash) {
				if (err) {
					console.log({ err });
					reject(err);
				}
				console.log({ hash, salt });
				resolve({ hash, salt });
			});
		});
	});
}

class HashLogic {
	constructor(hash = new Hash()) {
		let data = {
			hash,
			...this,
			Columns: {
				user: "Usuario",
				hash: "Hash",
				salt: "Salt",
				lastModified: "ÚltimaModificación",
				active: "Activo",
			},
			Table: "Hashes",
		};
		Object.assign(this, data);
	}

	async CheckPassword({ user, password } = obj, next) {
		let hash, salt;
		let cn = new Connection(Connection.Database.Eclair);
		let result = cn.Response.ErrorFound
			? cn.Response
			: await cn.FetchData(
					`SELECT [${this.Columns.hash}], [${this.Columns.salt}] 
               FROM [${this.Table}]
               WHERE [${this.Columns.user}] = '${user}' AND [${this.Columns.active}] = '1'
               ORDER BY [${this.Columns.lastModified}] DESC`
			  );
		if (!result.ErrorFound) {
			const record = result.ObjectReturned;
			if (record.length > 0) {
				const finalRow = record[0];
				hash = finalRow[this.Columns.hash];
				salt = finalRow[this.Columns.salt];
				try {
					const isMatch = await bcrypt.compare(password, hash);

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
	}
	async UnableAllFrom(user) {
		let cn = new Connection(Connection.Database.Eclair);
		let result = cn.Response.ErrorFound
			? cn.Response
			: await cn.RunTransaction(
					`UPDATE [${this.Table}] SET [${this.Columns.active}] = 0 WHERE [${this.Columns.user}] = '${user}'`
			  );
		console.log({ UNABLING: result });
		return {
			result: !result.ErrorFound,
		};
	}
	async CreatePassword(user, password) {
		console.log({ user, password });
		let VerificationsResult = false;
		let CleaningResult = false;
		let CryptingResult = false;
		let InsertResult = false;

		let checkPassword = (x) => /^[^\s]{8,24}$/.test(x);

		VerificationsResult = checkPassword(password);

		try {
			const { hash, salt } = await securePassword(password);
			console.log(33, { hash, salt });
			// Cancelamos todos los hashes previos (De haber)
			let _unabling = await this.UnableAllFrom(user);
			console.log({ SECURING: true, _unabling });
			CleaningResult = _unabling.result;

			// Agregamos el hash y el salt a la base de datos
			CryptingResult = true;
			let cn = new Connection(Connection.Database.Eclair);
			let result = cn.Response.ErrorFound
				? cn.Response
				: await cn.RunTransaction(
						`INSERT INTO [${this.Table}] ([${this.Columns.user}],[${this.Columns.hash}],[${this.Columns.salt}],[${this.Columns.lastModified}],[${this.Columns.active}]) SELECT '${user}', '${hash}', '${salt}', GETDATE(), '1'`
				  );
			console.log({ INSERTRESULT: result });
			InsertResult = result.AffectedRows == 1;
		} catch (error) {
			CryptingResult = false;
		}

		let SummaryResult =
			VerificationsResult &&
			CleaningResult &&
			CryptingResult &&
			InsertResult;

		return {
			SummaryResult,
			VerificationsResult,
			CleaningResult,
			CryptingResult,
			InsertResult,
		};
	}
}
module.exports = HashLogic;
