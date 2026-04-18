import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utilis/global-error-handler";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validationErrors: string[] = [];

        for (const key of Object.keys(schema) as ReqType[]) {
            const currentSchema = schema[key];
            if (!currentSchema) continue;

            const result = currentSchema.safeParse(req[key]);

            if (!result.success) {
                validationErrors.push(result.error.message);
            }
        }

        if (validationErrors.length > 0) {
            return next(new AppError(validationErrors.join(", "), 400));
        }

        next();
    };
};
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

