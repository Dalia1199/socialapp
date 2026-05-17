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
exports.notificationidschema = exports.updatenotificationschema = exports.createnotificationschema = void 0;
const z = __importStar(require("zod"));
const generalrules_1 = require("../../common/utilis/generalrules");
exports.createnotificationschema = {
    body: z.object({
        title: z.string().min(1, "title is required"),
        body: z.string().min(1, "body is required"),
        recipients: z.array(generalrules_1.generalrules.id).optional() // empty = broadcast to all
    })
};
exports.updatenotificationschema = {
    body: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        recipients: z.array(generalrules_1.generalrules.id).optional()
    }),
    params: z.object({ notificationid: generalrules_1.generalrules.id })
};
exports.notificationidschema = {
    params: z.object({ notificationid: generalrules_1.generalrules.id })
};
//# sourceMappingURL=notification.validation.js.map