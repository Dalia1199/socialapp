import mongoose, { Types } from "mongoose";
import { types } from "util";
import { _discriminatedUnion } from "zod/v4/core";
import { onmodel_enum } from "../../common/enum/post.enum";

export interface Icomment {
    content?: string,
    attachments?:string[],
    createdby:Types.ObjectId,
    tags?: Types.ObjectId [],
    likes?: Types.ObjectId[],
    folderid:string,
    // commentid?:Types.ObjectId
    // postid: Types.ObjectId
    refId:Types.ObjectId,
    onmodel:onmodel_enum
}
const commentschema = new mongoose.Schema<Icomment>({
    content:{type:String,min:1,required:function(this){
        return!this.attachments?.length
    }
},
attachments:[String],
createdby:{type:Types.ObjectId,ref :"user",required:true},
tags:[{type:Types.ObjectId,ref:"user"}],
likes: [{ type: Types.ObjectId, ref: "user" }],
folderid:String,
// commentid:{type:Types.ObjectId,ref:"comment"},
// postid:{type:Types.ObjectId,ref:"post",required:true}
 refId:{type:Types.ObjectId,refPath:"onmodel",required:true},//comment/post
 onmodel:{type:String,enum:onmodel_enum,required:true}
}, {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
commentschema.virtual("replies",{
    ref:"comment",
    localField:"_id",
    foreignField:"refId",
})

const commentmodel = mongoose.models.comment || mongoose.model<Icomment>("comment",commentschema)
export default commentmodel