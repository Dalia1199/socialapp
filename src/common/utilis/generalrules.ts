import { Types } from "mongoose";
import { buffer } from "node:stream/consumers";
import { MIMEType } from "node:util";
import * as z from "zod"
export const generalrules={
    id:z.string().refine((value)=>{
        return Types.ObjectId.isValid(value)
    },{
        message:"invalid id"
    }),
    file:z.object({
        fieldnamw:z.string(),
        originalname:z.string(),
        encoding:z.string(),
        mimetype:z.string(),
        buffer:z.any().optional(),
        path:z.string().optional(),
        size:z.number()


    })
}