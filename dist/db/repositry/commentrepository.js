"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = void 0;
const commenstmodel_1 = __importDefault(require("../models/commenstmodel"));
const base_repository_1 = require("./base.repository");
class commentRepository extends base_repository_1.BaseRepository {
    model;
    constructor(model = commenstmodel_1.default) {
        super(model);
        this.model = model;
    }
}
exports.commentRepository = commentRepository;
//# sourceMappingURL=commentrepository.js.map