import mongoose, { Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enum/userenum";
import { string, trim } from "zod";


export interface Iuser {
    _id: Types.ObjectId
    fname: string,
    lname: string,
    username: string,
    email: string,
    age: number,
    phone?: string,
    adress?: string,
    gender: GenderEnum,
    password: string,
    confirmed?: boolean,
    isdeleted: boolean,
    role?: RoleEnum,
    createdAt: Date,
    updatedAt: Date,


}
const userschema = new mongoose.Schema<Iuser>({
    fname: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 7,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 7,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,

        trim: true,
        minLength: 6
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enumm: GenderEnum,
        default: GenderEnum.male
    },
    role: {
        type: String,
        enum: RoleEnum

    },
    confirmed: Boolean,
    adress: {
        type: string,
        trim: true
    },

}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
userschema.virtual("username").get(function () {
    return this.fname + " " + this.lname
}).set(function (val: string) {
    this.set({ fname: val.split(" ")[0], lname: val.split(" ")[1] })
})

const usermodel = mongoose.models.user || mongoose.model<Iuser>("user", userschema)
export default usermodel