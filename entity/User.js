"use strict";
class User {
	constructor(data) {
		let obj = {
			username: null,
			name: null,
			surname: null,
			birthdate: null,
			sex: null,
			active: null,
			...data,
		};
		Object.assign(this, obj);
	}
	asJSON() {
		return {
			username: this.username,
			name: this.name,
			surname: this.surname,
			birthdate: this.birthdate,
			sex: this.sex,
			active: this.active,
		};
	}
	Username(val = null) {
		if (val != null) this.username = val;
		return this.username;
	}
	Name(val = null) {
		if (val != null) this.name = val;
		return this.name;
	}
	Surname(val = null) {
		if (val != null) this.surname = val;
		return this.surname;
	}
	Birthdate(val = null) {
		if (val != null) this.birthdate = val;
		return this.birthdate;
	}
	Sex(val = null) {
		if (val != null) this.sex = val;
		return this.sex;
	}
	Active(val = null) {
		if (val != null) this.active = val;
		return this.active;
	}
}
/*
            Columns: {
                username: "[NombreDeUsuario]",
                name: "[Nombre]",
                surname: "[Apellido]",
                birthdate: "[FechaDeNacimiento]",
                sex: "[Sexo]",
                active: "[Habilitado]"
            },
*/
module.exports = User;
