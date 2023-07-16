"use strict";
class Hash {
	constructor(obj) {
		let _ = {
			user: null,
			hash: null,
			salt: null,
			lastModified: new Date(),
			active: false,
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
			lastModified: this.lastModified,
			active: this.active,
		};
	}
}
module.exports = Hash;
