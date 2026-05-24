"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userType = exports.GenderType = void 0;
const graphql_1 = require("graphql");
exports.GenderType = new graphql_1.GraphQLEnumType({
    name: "GenderType",
    values: {
        male: { value: "male" },
        female: { value: "female" },
    },
});
exports.userType = new graphql_1.GraphQLObjectType({
    name: "getUser",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        age: { type: graphql_1.GraphQLInt },
        firstname: { type: graphql_1.GraphQLString },
        lastname: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString }
    },
});
//# sourceMappingURL=user.type.js.map