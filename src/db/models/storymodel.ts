import mongoose, { Types } from "mongoose";

const storyschema = new mongoose.Schema({
    content: {
        type: String,
        trim: true
    },
    media: {
        type: [String],
        default: []
    },
    createdby: {
        type: Types.ObjectId,
        ref: "user",
        required: true
    },
    folderid: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

storyschema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

const storymodel =
    mongoose.models.story ||
    mongoose.model("story", storyschema)

export default storymodel