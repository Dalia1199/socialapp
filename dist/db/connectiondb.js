"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkconnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conflig_service_1 = require("../conflig/conflig.service");
const checkconnection = async () => {
    try {
        await mongoose_1.default.connect(conflig_service_1.mongourl);
        console.log(`databaseconnected successfuly${conflig_service_1.mongourl}`);
    }
    catch (error) {
        console.log(error);
    }
};
exports.checkconnection = checkconnection;
