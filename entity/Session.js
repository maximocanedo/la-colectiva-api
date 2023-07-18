"use strict";
class Session {
	constructor(obj) {
		let _ = {
			id: null,
			user: null,
			status: false,
			...obj,
			...this,
		};
		Object.assign(this, _);
	}
}
module.exports = Session;
