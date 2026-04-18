"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const global_error_handler_1 = require("../utilis/global-error-handler");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            const currentSchema = schema[key];
            if (!currentSchema)
                continue;
            const result = currentSchema.safeParse(req[key]);
            if (!result.success) {
                validationErrors.push(result.error.message);
            }
        }
        if (validationErrors.length > 0) {
            return next(new global_error_handler_1.AppError(validationErrors.join(", "), 400));
        }
        next();
    };
};
exports.validation = validation;
// const result = await signupschema.safeParseAsync(req.body)
//          console.log(result)
//          if(!result.success){
//           throw new AppError(JSON.parse(result.error.message),400)}
// try{
// signupschema.parse(req.body)}
// catch(error:any){
//     throw new AppError(JSON.parse(error.message))
// }
//or await signupschema.parseasync(req.body).catch((error:any)=>{
//             throw new AppError(JSON.parse(error.message),400)
// })
