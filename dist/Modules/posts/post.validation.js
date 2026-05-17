"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletepostschema = exports.reactpostschema = exports.updatepostschema = exports.likepostschema = exports.createpostschema = void 0;
const z = __importStar(require("zod"));
const post_enum_1 = require("../../common/enum/post.enum");
const generalrules_1 = require("../../common/utilis/generalrules");
exports.createpostschema = {
    body: z.strictObject({
        content: z.string().optional(),
        attachments: z.array(generalrules_1.generalrules.file).optional(),
        tags: z.array(generalrules_1.generalrules.id).optional(),
        availability: z.enum(post_enum_1.availability_enum).default(post_enum_1.availability_enum.puplic),
        allowcomment: z.enum(post_enum_1.allow_comment_enum).default(post_enum_1.allow_comment_enum.allow),
    }).superRefine((args, ctx) => {
        if (!args.content && !args.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content is required"
            });
        }
        if (args?.tags) {
            const uniquetags = new Set(args.tags);
            if (args.tags.length !== uniquetags.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "duplicate tags"
                });
            }
        }
    })
};
exports.likepostschema = {
    params: z.strictObject({
        postid: generalrules_1.generalrules.id
    })
};
exports.updatepostschema = {
    body: z.strictObject({
        content: z.string().optional(),
        attachments: z.array(generalrules_1.generalrules.file).optional(),
        removefiles: z.array(z.string()).optional(),
        tags: z.array(generalrules_1.generalrules.id).optional(),
        availability: z.enum(post_enum_1.availability_enum).default(post_enum_1.availability_enum.puplic),
        allowcomment: z.enum(post_enum_1.allow_comment_enum).default(post_enum_1.allow_comment_enum.allow),
        removetags: z.array(generalrules_1.generalrules.id).optional(),
    }).superRefine((args, ctx) => {
        if (args?.tags) {
            const uniquetags = new Set(args.tags);
            if (args.tags.length !== uniquetags.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "duplicate tags"
                });
            }
        }
    }),
    params: exports.likepostschema.params
};
exports.reactpostschema = {
    params: z.object({ postid: generalrules_1.generalrules.id }),
    body: z.object({ type: z.string().optional() })
};
exports.deletepostschema = {
    params: z.object({ postid: generalrules_1.generalrules.id })
};
//# sourceMappingURL=post.validation.js.map