import {Model} from "mongoose";
import chatmodel, { Ichat }  from  "../models/chatmodel";
import { BaseRepository } from "./base.repository";

export class chatRepository extends BaseRepository<Ichat> {
  constructor(protected readonly model: Model<Ichat> =chatmodel) {
    super(model)
  }

}