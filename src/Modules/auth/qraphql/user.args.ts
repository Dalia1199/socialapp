import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderType } from "./user.type";

export const getuserargs={
                        id: { type: new GraphQLNonNull(GraphQLInt) },
    
}
export const createuserargs={
                    id: { type: new GraphQLNonNull(GraphQLInt) },
                    age: { type: new GraphQLNonNull(GraphQLInt) },
                    name: { type: new GraphQLNonNull(GraphQLString) },
                    gender: { type: new GraphQLNonNull(GenderType) },

                }