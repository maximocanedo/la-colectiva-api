"use strict";
class Hash {
	constructor(obj) {
		let _ = {
			user: null,
			hash: null,
			salt: null,
			created: null,
			status: false,
			...obj,
			...this,
		};
		Object.assign(this, _);
	}
	asJSON() {
		return {
			user: this.user,
			hash: this.hash,
			salt: this.salt,
			created: this.created,
			status: this.status,
		};
	}
}
module.exports = Hash;
