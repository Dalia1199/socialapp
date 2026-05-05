import { NextFunction, Request, Response } from "express";
import { object, ZodType } from "zod";
import { AppError } from "../utilis/global-error-handler";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

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

export const validation =(Schema:SchemaType)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        const errorvalidation=[]
        for (const key of Object.keys(Schema) as ReqType[]){
            if (!Schema[key])continue
            if(req?.file){
                req.body.attachment=req.file
            }
            if(req?.files){req.body.attachments=req.files}
            const result =await Schema[key].safeParseAsync(req[key])
            if(!result?.success){
                const errors=result.error.issues.map((err:any)=>{
                    return {
                        key,
                        path:err.path[0],
                        Message:err.message
                    }
                })
                errorvalidation.push(...errors)
            }
        }
        if(errorvalidation.length){

            throw new AppError(errorvalidation,400)
        }
        
    }

}