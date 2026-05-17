import * as z from "zod";
import { generalrules } from "../../common/utilis/generalrules";

export const createnotificationschema = {
    body: z.object({
        title: z.string().min(1, "title is required"),
        body: z.string().min(1, "body is required"),
        recipients: z.array(generalrules.id).optional()  // empty = broadcast to all
    })
}

export const updatenotificationschema = {
    body: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        recipients: z.array(generalrules.id).optional()
    }),
    params: z.object({ notificationid: generalrules.id })
}

export const notificationidschema = {
    params: z.object({ notificationid: generalrules.id })
}
