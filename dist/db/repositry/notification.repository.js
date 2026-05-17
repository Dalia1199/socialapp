"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const notificationmodel_1 = __importDefault(require("../models/notificationmodel"));
const base_repository_1 = require("./base.repository");
class notificationRepository extends base_repository_1.BaseRepository {
    model;
    constructor(model = notificationmodel_1.default) {
        super(model);
        this.model = model;
    }
}
exports.notificationRepository = notificationRepository;
//# sourceMappingURL=notification.repository.js.map