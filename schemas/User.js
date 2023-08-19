const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schemaCommonProperties = {
	type: String,
	required: true,
	default: "Something",
	immutable: false,
	min: 1,
	max: 99,
	minLength: 24,
	validate: {
		validator: (x) => {
			return x % 2 === 0;
		},
		message: "Number's not even.",
	},
	unique: true,
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Parent",
	},
	// comments: [CommentSchema],
};

const UserStatics = {
	roles: {
		// El usuario está bloqueado y está limitado a las funciones básicas (lectura)
		LIMITED: 0,
		// El usuario puede ver horarios, comentar objetos, dar likes, etc.
		NORMAL: 1,
		// El usuario puede agregar horarios, lugares, objetos, etc.
		MODERATOR: 2,
		// El usuario puede administrar los privilegios de los demás usuarios.
		ADMIN: 3,
	},
	properties: [
		"username",
		"name",
		"bio",
		"birth",
		"role",
		"password",
		"active",
	],
};

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		match: /^[a-zA-Z0-9_]{3,16}$/,
		unique: true,
	},
	name: {
		type: String,
		required: true,
		maxlength: 24,
		minlength: 3,
	},
	bio: {
		type: String,
		required: false,
		maxlength: 48,
	},
	birth: {
		type: Date,
		required: true,
	},
	role: {
		type: Number,
		required: true,
		default: UserStatics.roles.NORMAL,
	},
	password: {
		type: String,
		required: true,
	},
	active: {
		type: Boolean,
		required: true,
		default: true,
	},
});

userSchema.methods.sayHi = function () {
	console.log(`Hi! My name's ${this.name}`);
};

const hashPassword = async (password) => {
	try {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(this.password, saltRounds);
		return {
			password: hashedPassword,
			error: null,
		};
	} catch (error) {
		return {
			password: null,
			error,
		};
	}
};

// Agregamos un hook para hash y salt de la contraseña antes de guardar el usuario
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	try {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(this.password, saltRounds);
		console.log({ hashedPassword });
		this.password = hashedPassword;
		next(); // No usar await acá.
	} catch (error) {
		return next(error);
	}
});

userSchema.statics.isUsernameAvailable = async function (username) {
	const user = await this.find({ username }).count();
	//console.log({ usernameAvailable: user });
	return user == 0;
};
// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (password) {
	try {
		//console.log({ legacyPassword: this.password, password });
		return await bcrypt.compare(password, this.password);
	} catch (error) {
		throw error;
	}
};

module.exports = mongoose.model("User", userSchema);
