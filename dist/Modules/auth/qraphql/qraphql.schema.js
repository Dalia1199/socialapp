"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qraphqlschema = void 0;
const graphql_1 = require("graphql");
const user_fields_1 = __importDefault(require("../auth/qraphql/user.fields"));
exports.qraphqlschema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "query",
        fields: {
            ...user_fields_1.default.query()
        }
    }),
    mutation: new graphql_1.GraphQLObjectType({
        name: "mutation",
        fields: {
            ...user_fields_1.default.mutation()
        }
    })
});
//# sourceMappingURL=qraphql.schema.js.map