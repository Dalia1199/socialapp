import * as z from "zod";
import { generalrules } from "../../common/utilis/generalrules";
import { onmodel_enum } from "../../common/enum/post.enum";

export const createcommentschema = {
  body: z.strictObject({
    content:z.string().optional(),
    attachments:z.array(generalrules.file).optional(),
    tags:z.array(generalrules.id).optional(),
    onmodel:z.enum(onmodel_enum),
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
  }),
  params:z.strictObject({
    postid:generalrules.id,
    commentid:generalrules.id.optional()
  })
}