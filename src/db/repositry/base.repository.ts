
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

export  abstract class BaseRepository<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}
   async checkuser(email:string)
    { const emailExist = await this.model.findOne({ filter: { email } })
            if (emailExist) {
                throw new AppError("email already exist", 409)
            }
            return true
          }
  

  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return await this.model.create(data);
  }

  async findById(
    id: Types.ObjectId
  ): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findById(id);
  }

  async findOne({
    filter,
    projection,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOne(filter, projection);
  }

  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[]> {
   return this.model.find(filter, projection)
   .sort(options?.sort!)
   .skip(options?.skip!)
   .limit(options?.limit!)
.populate(options?.populate as PopulateOptions );}

   
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findByIdAndUpdate(id, update,{ new: true, ...options}
   );
  }
  async findoneAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findByIdAndUpdate(id, update, { new: true, ...options }
    );
  }

  async findByIdAndDelete(
    id: Types.ObjectId
  ): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async findOneAndDelete({filter,options}:
   { filter: QueryFilter<TDocument>,
        options?: QueryOptions<TDocument>,}

  ): Promise<HydratedDocument<TDocument> | null> {
    return  this.model.findOneAndDelete(filter);
  }
}
