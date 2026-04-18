"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const global_error_handler_1 = require("../../common/utilis/global-error-handler");
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async checkuser(email) {
        const emailExist = await this.model.findOne({ filter: { email } });
        if (emailExist) {
            throw new global_error_handler_1.AppError("email already exist", 409);
        }
        return true;
    }
    async create(data) {
        return await this.model.create(data);
    }
    async findById(id) {
        return await this.model.findById(id);
    }
    async findOne({ filter, projection, }) {
        return await this.model.findOne(filter, projection);
    }
    async find({ filter, projection, options, }) {
        return this.model.find(filter, projection)
            .sort(options?.sort)
            .skip(options?.skip)
            .limit(options?.limit)
            .populate(options?.populate);
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return await this.model.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    async findoneAndUpdate({ id, update, options, }) {
        return await this.model.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    async findByIdAndDelete(id) {
        return await this.model.findByIdAndDelete(id);
    }
    async findOneAndDelete({ filter, options }) {
        return this.model.findOneAndDelete(filter);
    }
}
exports.BaseRepository = BaseRepository;
