import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";

export const GenderType = new GraphQLEnumType({
    name: "GenderType",
    values: {
        male: { value: "male" },
        female: { value: "female" },
    },
});

 export const userType = new GraphQLObjectType({
    name: "getUser",
    fields: {
        _id: { type: GraphQLID },
        age: { type: GraphQLInt },
        firstname: { type: GraphQLString },
        lastname: { type: GraphQLString },
        email: { type: GraphQLString }

    },
});