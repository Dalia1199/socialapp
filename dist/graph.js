"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const GenderType = new GraphQLEnumType({
    name: "GenderType",
    values: {
        male: { value: "male" },
        female: { value: "female" },
    },
});
const userType = new graphql_1.GraphQLObjectType({
    name: "getUser",
    fields: {
        id: { type: graphql_1.GraphQLInt },
        age: { type: graphql_1.GraphQLInt },
        name: { type: GraphQLString },
        gender: {
            type: GenderType,
        },
    },
});
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "query",
        fields: {},
    }),
    mutation: new graphql_1.GraphQLObjectType({
        name: "mutation",
        fields: {
            createUser: {
                type: userType,
                args: {
                    id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
                    age: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
                    gender: { type: new graphql_1.GraphQLNonNull(GenderType) },
                    name: { type: new graphql_1.GraphQLNonNull(GraphQLString) },
                },
                resolve: (parent, args) => {
                    const userExist = users.find((user) => user.id === args.id);
                    if (userExist) {
                        throw new AppError("User already exist");
                    }
                    users.push(args);
                    return args;
                },
            },
        },
    }),
});
//# sourceMappingURL=graph.js.map