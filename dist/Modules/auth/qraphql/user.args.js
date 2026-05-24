"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createuserargs = exports.getuserargs = void 0;
const graphql_1 = require("graphql");
const user_type_1 = require("./user.type");
exports.getuserargs = {
    id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
};
exports.createuserargs = {
    id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
    age: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
    name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    gender: { type: new graphql_1.GraphQLNonNull(user_type_1.GenderType) },
};
//# sourceMappingURL=user.args.js.map