"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const base_repository_1 = require("./base.repository");
class userRepository extends base_repository_1.BaseRepository {
    model;
    constructor(model = user_model_1.default) {
        super(model);
        this.model = model;
    }
}
exports.userRepository = userRepository;
