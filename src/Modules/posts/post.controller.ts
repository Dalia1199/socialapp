import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import postService from "./post.service";
import { validation } from "../../common/middleware/validation";
import * as postvalidation from "./post.validation"
import multercloud from "../../common/middleware/multer.cloud";
import { store_enum } from "../../common/enum/multerenum";
import commentrouter from "../comments/commentscontroller";
import { authorization } from "../../common/middleware/authorization";

const postrouter=Router();
postrouter.use("/:postid/comments{/:commentid/replies}",commentrouter)
postrouter.post("/", authentication,multercloud({store_type:store_enum.memory}).array("attachments"),
validation(postvalidation.createpostschema),postService.createpost)
postrouter.get("/",authentication,postService.getposts)
postrouter.patch("/:postid",authentication,validation(postvalidation.likepostschema),postService.likepost)
postrouter.put("/update/:postid",authentication,multercloud({store_type:store_enum.memory}).array("attachments"),
validation(postvalidation.updatepostschema),
postService.updatepost)
postrouter.delete("/:postid",
    authentication,
    validation(postvalidation.deletepostschema),
    postService.softdeletepost
)

postrouter.delete("/:postid/hard",
    authentication,
    validation(postvalidation.deletepostschema),
    postService.harddeletepost
)
postrouter.patch("/:postid/react",
    authentication,
    validation(postvalidation.reactpostschema),
    postService.reactpost
)
postrouter.patch("/:postid/like",
    authentication,
    validation(postvalidation.likepostschema),
    postService.likepost
)
postrouter.get("/dashboard", authentication, authorization(["admin"]), postService.dashboard)
postrouter.get("/", authentication, postService.getposts)

export  default postrouter