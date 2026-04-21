 import * as z from "zod";
 import { confirmemailschema,signupschema } from "./user.validation";
export type IsignupType = z.infer<typeof signupschema.body>
export type IconfirmemailType = z.infer<typeof confirmemailschema.body>
