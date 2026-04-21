"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successresponse = void 0;
const successresponse = ({ res, status = 200, message = "done", data = undefined }) => {
    return res.status(status).json({ message, data });
};
exports.successresponse = successresponse;
