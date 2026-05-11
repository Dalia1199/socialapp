import * as z from "zod";
import { createpostschema, updatepostschema } from "./post.validation";
export type createpostdto=z.infer<typeof createpostschema.body>
export type updatepostdto=z.infer<typeof updatepostschema.body>
export type postiddto = z.infer<typeof updatepostschema.body>

