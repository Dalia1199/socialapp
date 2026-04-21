import mongoose from "mongoose";

const revokedTokenSchema = new mongoose.Schema(
    {
        tokenId: {
            type: String,
            required: true,
            trim: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        expiredAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

revokedTokenSchema.index(
    { expiredAt: 1 },
    { expireAfterSeconds: 0 }
);

const RevokedTokenModel =
    mongoose.models.RevokedToken ||
    mongoose.model("RevokedToken", revokedTokenSchema);

export default RevokedTokenModel;