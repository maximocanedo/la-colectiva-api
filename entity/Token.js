"use strict";
class Token {
	constructor(obj) {
		let _ = {
			token: null,
			active: null,
			created: new Date(),
			...obj,
			...this,
		};
		Object.assign(this, _);
	}
}
module.exports = Token;
