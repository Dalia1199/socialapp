import { Router } from "express";
const authRouter=Router()
import   userservice from "./user.service"
import { validation } from "../../common/middleware/validation";
import * as uservalidation  from "./user.validation";

authRouter.post("/signup",validation(uservalidation.signupschema),userservice.signup)
authRouter.post("/signin", userservice.signin)
authRouter.patch("/confirm-email", validation(uservalidation.confirmemailschema), userservice.confirmemail)






export default authRouter