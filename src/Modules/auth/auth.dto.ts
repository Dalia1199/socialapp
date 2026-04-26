 import * as z from "zod";
 import { confirmemailschema,resendotpschema,signinschema,signupschema } from "./user.validation";
export type IsignupType = z.infer<typeof signupschema.body>
export type IconfirmemailType = z.infer<typeof confirmemailschema.body>
export type IsigninType = z.infer<typeof signinschema.body>
export type IresendotpType = z.infer<typeof resendotpschema.body>