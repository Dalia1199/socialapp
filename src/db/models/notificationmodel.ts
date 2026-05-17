import mongoose, { Types } from "mongoose";

export interface Inotification {
    _id: Types.ObjectId,
    title: string,
    body: string,
    createdby: Types.ObjectId,    
    recipients?: Types.ObjectId[], 
    isread?: Types.ObjectId[],     
    isdeleted?: boolean,
    createdAt: Date,
    updatedAt: Date
}

const notificationschema = new mongoose.Schema<Inotification>({
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    createdby: { type: Types.ObjectId, ref: "user", required: true },
    recipients: [{ type: Types.ObjectId, ref: "user" }],
    isread: [{ type: Types.ObjectId, ref: "user" }],
    isdeleted: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const notificationmodel =
    mongoose.models.notification ||
    mongoose.model<Inotification>("notification", notificationschema)

export default notificationmodel
