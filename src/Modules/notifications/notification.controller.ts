import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import { authorization } from "../../common/middleware/authorization";
import { validation } from "../../common/middleware/validation";
import notificationmoduleservice from "./notification.service";
import * as notificationvalidation from "./notification.validation";

const notificationrouter = Router();

notificationrouter.post(
    "/",
    authentication,
    authorization(["admin"]),
    validation(notificationvalidation.createnotificationschema),
    notificationmoduleservice.createnotification
)

notificationrouter.get(
    "/all",
    authentication,
    authorization(["admin"]),
    notificationmoduleservice.getnotifications
)

notificationrouter.get(
    "/",
    authentication,
    notificationmoduleservice.getmynotifications
)

notificationrouter.patch(
    "/:notificationid/read",
    authentication,
    validation(notificationvalidation.notificationidschema),
    notificationmoduleservice.markasread
)

notificationrouter.put(
    "/:notificationid",
    authentication,
    authorization(["admin"]),
    validation(notificationvalidation.updatenotificationschema),
    notificationmoduleservice.updatenotification
)

notificationrouter.delete(
    "/:notificationid",
    authentication,
    authorization(["admin"]),
    validation(notificationvalidation.notificationidschema),
    notificationmoduleservice.deletenotification
)

export default notificationrouter
