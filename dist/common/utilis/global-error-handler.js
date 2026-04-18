"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalerrorhandler = exports.AppError = void 0;
class AppError extends Error {
    message;
    statuscode;
    constructor(message, statuscode = 500) {
        super(message);
        this.message = message;
        this.statuscode = statuscode;
        this.message = message;
        this.statuscode = statuscode;
    }
}
exports.AppError = AppError;
const globalerrorhandler = (err, req, res, next) => {
    // console.log(err.cause)
    const status = err.statuscode || 500;
    res.status(status).json({ message: err.message, status, stack: err.stack });
};
exports.globalerrorhandler = globalerrorhandler;
