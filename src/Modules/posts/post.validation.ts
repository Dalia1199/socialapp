import * as z from "zod";
import { GenderEnum } from "../../common/enum/userenum";
import { allow_comment_enum, availability_enum } from "../../common/enum/post.enum";
import { generalrules } from "../../common/utilis/generalrules";

export const createpostschema = {
  body: z.strictObject({
    content:z.string().optional(),
    attachments:z.array(generalrules.file).optional(),
    tags:z.array(generalrules.id).optional(),
      availabilit:z.enum(availability_enum).default(availability_enum.puplic),
      allowcomment:z.enum(allow_comment_enum).default(allow_comment_enum.allow),
  }).superRefine((args,ctx)=>{
    if(!args.content&&!args.attachments?.length){
        ctx.addIssue({
            code:"custom",
            path:["content"],
            message:"content is required"
        })
    }
    if (args?.tags){
        const uniquetags= new Set(args.tags)
        if(args.tags.length!==uniquetags.size){
            ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"duplicate tags"
            })

        }
    }
  })
}