import {Model} from "mongoose";
import postmodel  from  "../models/postmodel";
import { BaseRepository } from "./base.repository";
import { postuser } from "../models/postmodel";

export class postRepository extends BaseRepository<postuser> {
  constructor(protected readonly model: Model<postuser> =postmodel) {
    super(model)
  }


}
   