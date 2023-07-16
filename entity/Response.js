"use strict";
class Response {
	constructor(obj) {
		let newObj = {
			ErrorFound: false,
			Message: "",
			Details: "",
			Exception: null,
			Code: 200,
			AffectedRows: 0,
			ObjectReturned: null,
			...obj,
		};
		Object.assign(this, newObj);
	}
	asJSON() {
		return JSON.parse({
			ErrorFound: this.ErrorFound,
			Message: this.Message,
			Details: this.Details,
			Exception: this.Exception,
			Code: this.Code,
			AffectedRows: this.AffectedRows,
			ObjectReturned: this.ObjectReturned,
		});
	}
}
module.exports = Response;
