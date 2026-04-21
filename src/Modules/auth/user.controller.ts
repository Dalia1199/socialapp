import { Router } from "express";

import   userservice from "./user.service"
import { validation } from "../../common/middleware/validation";
import * as uservalidation  from "./user.validation";
import { authentication } from "../../common/middleware/authentication";
const authRouter = Router();
authRouter.post("/signup",validation(uservalidation.signupschema),userservice.signup)
authRouter.post("/signin", validation(uservalidation.signinschema), userservice.signin)
authRouter.patch("/confirm-email", validation(uservalidation.confirmemailschema), userservice.confirmemail)

authRouter.get("/profile", authentication,userservice.getprofile)




export default authRouter