import * as z from "zod";
import { GenderEnum } from "../../common/enum/userenum";

export const signupschema = {
  body: z.object({
    username: z.string({ error: "name is required" }).min(3),
    email: z.string().email(),
    password: z.string().min(6),
    cpassword: z.string().min(6),
    age: z.number().min(18),
    gender: z.enum(GenderEnum),
    address: z.string().optional(),
    phone: z.string().optional()
  })
    .superRefine((data, ctx) => {
      console.log(data)
      if (data.password !== data.cpassword) {
        ctx.addIssue({
          code: "custom",
          path: ["cpaasword"],
          message: "password donotmatch"
        })
      }
    })
}
export const confirmemailschema :any={
  body: z.strictObject({
    email: z.email("invalid email"),
    code: z.string().length(6, "invalid code")
  })
}
// .refine((data)=>{
//     return data.password==data.cpassword
// },{
//   error:"password do not match",
//   path:["cpassword"] })
