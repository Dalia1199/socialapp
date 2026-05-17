import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import commentservice from "./comments.service";
import { validation } from "../../common/middleware/validation";
import * as commentvalidation from "./comment.validation"
import multercloud from "../../common/middleware/multer.cloud";
import { store_enum } from "../../common/enum/multerenum";

const commentrouter=Router({mergeParams:true});
commentrouter.post("/",
    authentication,
    multercloud({ store_type: store_enum.memory }).array("attachments"),
    validation(commentvalidation.createcommentschema),
    commentservice.createcomment
)
commentrouter.get("/",
    authentication,
    commentservice.getcomments
)




commentrouter.put("/:commentid",
    authentication,
    multercloud({ store_type: store_enum.memory }).array("attachments"),
    validation(commentvalidation.updatecommentschema),
    commentservice.updatecomment
)

commentrouter.delete("/:commentid",
    authentication,
    validation(commentvalidation.deletecommentschema),
    commentservice.softdeletecomment
)

commentrouter.delete("/:commentid/hard",
    authentication,
    validation(commentvalidation.deletecommentschema),
    commentservice.harddeletecomment
)

commentrouter.patch("/:commentid/react",
    authentication,
    validation(commentvalidation.reactcommentschema),
    commentservice.reactcomment
)
   

export  default commentrouter