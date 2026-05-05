import * as z from "zod";
import { createpostschema } from "./post.validation";
export type createpostdto=z.infer<typeof createpostschema.body>