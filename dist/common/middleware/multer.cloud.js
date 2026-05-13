"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multerenum_1 = require("../enum/multerenum");
const node_os_1 = require("node:os");
const multercloud = ({ store_type = multerenum_1.store_enum.memory, custom_types = multerenum_1.multer_enum.Image, maxfilesize = 5 * 1024 * 1024 } = {}) => {
    const storage = store_type === multerenum_1.store_enum.memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination: (0, node_os_1.tmpdir)(),
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    });
    function fileFilter(req, file, cb) {
        if (!custom_types.includes(file.mimetype)) {
            cb(new Error('invalid file type'));
        }
        else {
            cb(null, true);
        }
    }
    const upload = (0, multer_1.default)({ storage, fileFilter, limits: { fileSize: maxfilesize } });
    return upload;
};
exports.default = multercloud;
//# sourceMappingURL=multer.cloud.js.map