import mongoose, { Types } from "mongoose";

export interface Ichat {
   
    createdby:Types.ObjectId,
    participants: Types.ObjectId[],
    message:Imessage[]
    groupimage:string,
    group:string,
    roomid:string,
}
interface Imessage{
    createdby: Types.ObjectId,
    content: string
}
const messageschema = new mongoose.Schema<Imessage>({
    content:{type:String,required:true},
    createdby:{type:Types.ObjectId,ref:"user",required:true},


},{
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
const chatschema = new mongoose.Schema<Ichat>({
    message:[messageschema],
   roomid:String,
    createdby: { type: Types.ObjectId, ref: "user", required: true },
    participants: [{ type: Types.ObjectId, ref: "user", required: true }],
message:[messageschema],
roomid:String,
group:String,
groupimage:String,

},{
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }

})

const chatmodel = mongoose.models.chat || mongoose.model<Ichat>("chat",chatschema)
export default chatmodel