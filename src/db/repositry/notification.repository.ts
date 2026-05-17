import { Model } from "mongoose";
import notificationmodel, { Inotification } from "../models/notificationmodel";
import { BaseRepository } from "./base.repository";

export class notificationRepository extends BaseRepository<Inotification> {
    constructor(protected readonly model: Model<Inotification> = notificationmodel) {
        super(model)
    }
}
