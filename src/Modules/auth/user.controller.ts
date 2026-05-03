import { Router } from "express";

import   userservice from "./user.service"
import { validation } from "../../common/middleware/validation";
import * as uservalidation  from "./user.validation";
import { authentication } from "../../common/middleware/authentication";
import multercloud from "../../common/middleware/multer.cloud";
import { store_enum } from "../../common/enum/multerenum";
const authRouter = Router();
authRouter.post("/signup",validation(uservalidation.signupschema),userservice.signup)
authRouter.post("/signin", validation(uservalidation.signinschema), userservice.signin)
authRouter.patch("/confirm-email", validation(uservalidation.confirmemailschema), userservice.confirmemail)
authRouter.get("/profile", authentication,userservice.getprofile)
authRouter.post("/signup-gmail", userservice.signupwithgmail)
authRouter.post("/login-gmail", userservice.loginwithgmail)
authRouter.post("/logout", authentication, userservice.logout)
authRouter.post("/forget-password", userservice.forgetpassword)
authRouter.patch("/reset-password", userservice.resetpassword)
authRouter.patch("/update-password", authentication, userservice.updatepassword)
authRouter.post("/upload",multercloud({store_type:store_enum.memory}).array("attachment"),userservice.uploadimage)

authRouter.post("/uplad",authentication,userservice.upload)
export default authRouter