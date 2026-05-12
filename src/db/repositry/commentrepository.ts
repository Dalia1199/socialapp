import {Model} from "mongoose";
import commentmodel  from  "../models/commenstmodel";
import { BaseRepository } from "./base.repository";
import { Icomment } from "../models/commenstmodel";

export class commentRepository extends BaseRepository<Icomment> {
  constructor(protected readonly model: Model<Icomment> =commentmodel) {
    super(model)
  }


}
   