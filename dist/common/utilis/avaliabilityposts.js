"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.avaliabilitypost = void 0;
const post_enum_1 = require("../enum/post.enum");
const avaliabilitypost = (req) => {
    return [
        { availability: post_enum_1.availability_enum.puplic }, // FIX: puplic kept as original spelling
        {
            availability: post_enum_1.availability_enum.friends,
            createdby: { $in: [req.user?._id, ...(req.user?.friends || [])] }
        },
        { availability: post_enum_1.availability_enum.only_me, createdby: req?.user?._id },
        { tags: { $in: [req?.user?._id] } }
    ];
};
exports.avaliabilitypost = avaliabilitypost;
//# sourceMappingURL=avaliabilityposts.js.map