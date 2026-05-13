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
    async findoneAndUpdate({ id, filter, update, options, }) {
        if (id) {
            return await this.model.findByIdAndUpdate(id, update, { new: true, ...options });
        }
        return await this.model.findOneAndUpdate(filter, update, { new: true, ...options });
    }
    async findByIdAndDelete(id) {
        return await this.model.findByIdAndDelete(id);
    }
    async findOneAndDelete({ filter, options }) {
        return this.model.findOneAndDelete(filter);
    }
    async paginate({ page, limit, sort, populate, search, }) {
        page = +page || 1;
        limit = +limit || 1;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 2;
        const skip = (page - 1) * limit;
        const [data, totaldocs] = await Promise.all([
            await this.model.find({ ...(search ?? {}) }).limit(limit).skip(skip).sort(sort).populate(populate),
            await this.model.countDocuments({ ...(search ?? {}) })
        ]);
        const totalpages = Math.ceil(totaldocs / limit);
        return { meta: {
                currentpage: page,
                totalpages,
                limit,
                totaldocs
            },
            data
        };
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map