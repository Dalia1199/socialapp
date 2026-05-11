import { BaseRepository } from "./base.repository";

export class storyrepository extends BaseRepository<Istory> {
    constructor() {
        super(storymodel)
    }
}