'use strict';

const DefaultError = class extends Error {
    constructor(info) {
        super(info);
        const { message, code, details, type, instance, report } = {
            message: "An error has occurred. Please try again later.",
            code: "E-0000",
            details: null,
            type: "/errors/default",
            instance: null,
            report: false,
            ...info,
        };

        this.getData = () => ({
            message,
            code,
            details,
            type,
            instance,
        });
        this.getMessage = () => message;
        this.getCode = () => code;
        this.getDetails = () => details;
        this.getType = () => type;
        this.getInstance = () => instance;
        this.isReportable = () => report;


        this.report = async () => {
            if (report) {
                return null;
            }
        };



    }
};

module.exports = DefaultError;