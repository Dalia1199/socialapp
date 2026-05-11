"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRepository = void 0;
const postmodel_1 = __importDefault(require("../models/postmodel"));
const base_repository_1 = require("./base.repository");
class postRepository extends base_repository_1.BaseRepository {
    model;
    constructor(model = postmodel_1.default) {
        super(model);
        this.model = model;
    }
}
exports.postRepository = postRepository;
