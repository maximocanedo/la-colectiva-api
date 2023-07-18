"use strict";
class User {
	static roles = [
		"ADMIN", // Administrador. Puede cambiar permisos de los demás, bloquear cuentas, etc.
		"MODERATOR", // Moderador. Puede subir horarios, rutas, fotos, muelles, etc.
		"NORMAL", // Normal. Puede comentar, validar.
		"BLOCKED", // Cuenta suspendida. No puede comentar ni validar.
	];
	constructor(data) {
		let obj = {
			username: null,
			name: null,
			surname: null,
			bio: null,
			birthdate: null,
			role: null,
			status: null,
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
