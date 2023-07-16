"use strict";
const Connection = require("./../data/Connection");
const User = require("./../entity/User");
const utilities = require("./../logic/utilities");

class UserLogic {
	constructor(user = new User()) {
		let data_ = {
			user,
			...this,
			Columns: {
				username: "NombreDeUsuario",
				name: "Nombre",
				surname: "Apellido",
				birthdate: "FechaDeNacimiento",
				sex: "Sexo",
				active: "Habilitado",
			},
			Table: "Usuarios",
		};
		Object.assign(this, data_);
	}
	setFromRecordSet(obj) {
		this.user.username = obj[this.Columns.username];
		this.user.name = obj[this.Columns.name];
		this.user.surname = obj[this.Columns.surname];
		this.user.birthdate = obj[this.Columns.birthdate];
		this.user.sex = obj[this.Columns.sex];
		this.user.active = obj[this.Columns.active];
	}
	async getByUsername(username) {
		let cn = new Connection(Connection.Database.Eclair);
		let data = cn.Response.ErrorFound
			? cn.Response
			: await cn.FetchData(
					`SELECT [${this.Columns.username}], [${this.Columns.name}], [${this.Columns.surname}], [${this.Columns.birthdate}], [${this.Columns.sex}], [${this.Columns.active}] FROM [${this.Table}] WHERE [${this.Columns.username}] = '${username}'`
			  );
		if (data.ErrorFound == false) {
			const result = data.ObjectReturned;
			if (result.length > 0) {
				const res = result[0];
				this.setFromRecordSet(res);
				//return res;
				return {
					ErrorFound: false,
					ObjectReturned: this.user,
					Code: 200,
				};
			} else {
				return {
					ErrorFound: true,
					Message: "User not found",
					Code: 404,
				};
			}
		}
		return data;
	}
	async AddUser(user) {
		let userCheckAvailability = await this.getByUsername(user.username);
		let userCheckWritting = (x) => /^[a-zA-Z0-9_-]{3,24}$/.test(x);
		let _usernameCheckAvailability = {
			res: userCheckAvailability.Code == 404,
			err: "El nombre de usuario ya existe",
		};
		let _usernameCheckWritting = {
			res: userCheckWritting(user.username),
			err: "El nombre de usuario no cumple con las reglas. ",
		};
		let namesCheck = (str) => {
			const regex = /^[\p{L}\p{M}\s'-]{3,48}$/u;
			return regex.test(str);
		};
		let _nameCheck = {
			res: namesCheck(user.name),
			err: "El nombre ingresado no cumple con las reglas. ",
		};
		let _surnameCheck = {
			res: namesCheck(user.surname),
			err: "El apellido ingresado no cumple con las reglas. ",
		};
		let formattedDate = utilities.formatDateForSQL(user.birthdate);
		let sexCheck = (str) => str == "M" || str == "F";
		let _sexCheck = {
			res: sexCheck(user.sex),
			err: "El valor ingresado para 'Sexo' no es correcto. ",
		};
		let errMsg = [];
		let VerificationsResult = true;
		[
			_usernameCheckAvailability,
			_usernameCheckWritting,
			_nameCheck,
			_surnameCheck,
			_sexCheck,
		].map((verification) => {
			if (!verification.res) {
				errMsg.push(verification.err);
			}
			VerificationsResult = VerificationsResult && verification.res;
		});
		let InsertResult = false;
		if (VerificationsResult) {
			// Añadir registro
			let cn = new Connection(Connection.Database.Eclair);
			let result = cn.Response.ErrorFound
				? cn.Response
				: await cn.RunTransaction(
						`INSERT INTO [${this.Table}] 
						([${this.Columns.username}], [${this.Columns.name}], [${this.Columns.surname}], [${this.Columns.birthdate}], [${this.Columns.sex}], [${this.Columns.active}]) 
						SELECT '${user.username}', '${user.name}', '${user.surname}','${formattedDate}','${user.sex}', '1'`
				  );
			console.log({ result });
			InsertResult = !result.ErrorFound && result.AffectedRows == 1;
		}
		return {
			VerificationsResult,
			InsertResult,
			errMsg,
		};
	}
}

module.exports = UserLogic;
