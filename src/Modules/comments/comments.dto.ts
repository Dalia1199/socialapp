import * as z from "zod";
import { createcommentschema } from "./comment.validation";
export type createcommentdto=z.infer<typeof createcommentschema.body>