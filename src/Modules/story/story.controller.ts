 import { Router } from "express";
 import { authentication } from "../../common/middleware/authentication";
 import storyService from "./storyservice";
 import { validation } from "../../common/middleware/validation";
 import multercloud from "../../common/middleware/multer.cloud";
 import { store_enum } from "../../common/enum/multerenum";
const storyrouter = Router();

 storyrouter.post(
    "/",
    authentication,
     multercloud({ store_type: store_enum.memory }).array("attachments"),
    storyService.createstory
)



storyrouter.delete(
    "/:storyid",
    authentication,
    storyService.deletestory
)