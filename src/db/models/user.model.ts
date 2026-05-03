import mongoose, { Types } from "mongoose";
import { GenderEnum, providerenum, RoleEnum } from "../../common/enum/userenum";
import { string, } from "zod";
import { hash } from "crypto";


export interface Iuser {
    _id: Types.ObjectId
    fname: string,
    lname: string,
    username: string,
    email: string,
    provider?: providerenum,
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
    profilepic:String


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
    profilepic:String,
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: function (): boolean {
            return this.provider == providerenum.system ? true : false
        },

        trim: true,
        minLength: 6
    },
    provider: {
        type: String,
        enum: providerenum,
        default: providerenum.system
    },
    age: {
        type: Number,
        required: function (): boolean {
            return this.provider == providerenum.system ? true : false
        },
    },
    gender: {
        type: String,
        enum: GenderEnum,
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
// userschema.pre("findone",function(){
//     console.log("=====prehook====");
//     console.log(this.getquery());
//     const{paranoid,....rest}=this.getquery()
//     console.log({rest});
//     if (paranoid==false){
//         this.setquery({..rest});
    
//     }this.setquery({..rest,deletedAT:{$exists:false}})
// })
// userschema.pre("save", function () {
//     console.log("pre save hook");
//     console.log(this)
//     console.log (this.modifiedPaths());
//     if (this.isModified("password")) {
//         this.password = hash({ plaintext: this.password })
//     }
// })
const usermodel = mongoose.models.user || mongoose.model<Iuser>("user", userschema)
export default usermodel