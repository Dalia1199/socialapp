import * as z from "zod";
import { GenderEnum } from "../../common/enum/userenum";
import { allow_comment_enum, availability_enum } from "../../common/enum/post.enum";
import { generalrules } from "../../common/utilis/generalrules";

export const createpostschema = {
  body: z.strictObject({
    content:z.string().optional(),
    attachments:z.array(generalrules.file).optional(),
    tags:z.array(generalrules.id).optional(),
      availability:z.enum(availability_enum).default(availability_enum.puplic),
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

  export const likepostschema={
    params:z.strictObject({
        postid:generalrules.id
    })
  
}
export const updatepostschema = {
    body: z.strictObject({
        content: z.string().optional(),
        attachments: z.array(generalrules.file).optional(),
        removefiles:z.array(z.string()).optional(),
        tags: z.array(generalrules.id).optional(),
        availability: z.enum(availability_enum).default(availability_enum.puplic),
        allowcomment: z.enum(allow_comment_enum).default(allow_comment_enum.allow),
        removetags:z.array(generalrules.id).optional(),
    }).superRefine((args, ctx) => {
        
        if (args?.tags) {
            const uniquetags = new Set(args.tags)
            if (args.tags.length !== uniquetags.size) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "duplicate tags"
                })

            }
        }
    }),
    params:likepostschema.params
}