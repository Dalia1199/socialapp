import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import postService from "./post.service";
import { validation } from "../../common/middleware/validation";
import * as postvalidation from "./post.validation"

const postrouter=Router();
postrouter.post("/", authentication,validation(postvalidation.createpostschema),postService.createpost)
  
export  default postrouter