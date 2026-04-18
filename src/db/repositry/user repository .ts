
    import {
  HydratedDocument,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";
import { AppError } from "../../common/utilis/global-error-handler";
import usermodel, { Iuser } from "../models/user.model";
import { BaseRepository } from "./base.repository";

export class userRepository extends BaseRepository<Iuser> {
  constructor(protected readonly model: Model<Iuser> =usermodel) {
    super(model)
  }


}
   