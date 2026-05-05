import mongoose, { Types } from "mongoose";
import {allow_comment_enum, availability_enum} from "../../common/enum/post.enum"

export interface postuser {
    content?: string,
    attachments?:string[],
    createdby:Types.ObjectId,
    tags?: Types.ObjectId [],
    likes?: Types.ObjectId[],
    allowcomments?: allow_comment_enum,
    availability?:availability_enum,
    folderid:string
}
const postschema = new mongoose.Schema<postuser>({
    content:{type:String,min:1,required:function(this){
        return!this.attachments?.length
    }
},
attachments:[String],
createdby:{type:Types.ObjectId,ref :"user",required:true},
tags:[{type:Types.ObjectId,ref:"user"}],
    likes: [{ type: Types.ObjectId, ref: "user" }],
    allowcomments:{type:String,enum:allow_comment_enum,default:allow_comment_enum.allow},
    availability: { type: String, enum: availability_enum, default:availability_enum.puplic },
    folderid:String
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const postmodel = mongoose.models.post || mongoose.model<postuser>("post",postschema)
export default postmodel