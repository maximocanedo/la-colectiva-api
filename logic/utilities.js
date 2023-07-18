"use strict";
const appendZeros = (number, quantity = 2) =>
	number.toString().padStart(quantity, "0");
const formatDateForSQL = (obj = new Date(), onlyDate = false) => {
	const fullYear = obj.getFullYear();
	const month = appendZeros(obj.getMonth() + 1);
	const date = appendZeros(obj.getDate());
	const hours = appendZeros(obj.getHours());
	const minutes = appendZeros(obj.getMinutes());
	const seconds = appendZeros(obj.getSeconds());
	const milliseconds = appendZeros(obj.getMilliseconds(), 3);

	if (onlyDate) return `${fullYear}-${month}-${date}`;
	return `${fullYear}-${month}-${date} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};
module.exports = { appendZeros, formatDateForSQL };
