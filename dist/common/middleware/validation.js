"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const global_error_handler_1 = require("../utilis/global-error-handler");
// export const validation = (schema: SchemaType) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const validationErrors: string[] = [];
//         for (const key of Object.keys(schema) as ReqType[]) {
//             const currentSchema = schema[key];
//             if (!currentSchema) continue;
//             const result = currentSchema.safeParse(req[key]);
//             if (!result.success) {
//                 validationErrors.push(result.error.message);
//             }
//         }
//         if (validationErrors.length > 0) {
//             return next(new AppError(validationErrors.join(", "), 400));
//         }
//         next();
//     };
// };
const validation = (Schema) => {
    return async (req, res, next) => {
        const errorvalidation = [];
        for (const key of Object.keys(Schema)) {
            if (!Schema[key])
                continue;
            if (req?.file) {
                req.body.attachment = req.file;
            }
            if (req?.files) {
                req.body.attachments = req.files;
            }
            const result = await Schema[key].safeParseAsync(req[key]);
            if (!result?.success) {
                const errors = result.error.issues.map((err) => {
                    return {
                        key,
                        path: err.path[0],
                        Message: err.message
                    };
                });
                errorvalidation.push(...errors);
            }
        }
        if (errorvalidation.length) {
            throw new global_error_handler_1.AppError(errorvalidation, 400);
        }
        next();
    };
};
exports.validation = validation;
