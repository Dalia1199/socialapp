"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userfields = void 0;
const graphql_1 = require("graphql");
const global_error_handler_1 = require("../../../common/utilis/global-error-handler");
const user_type_1 = require("./user.type");
const user_args_1 = require("./user.args");
const user_service_1 = __importDefault(require("../user.service"));
let users = [
    { id: 1, name: "ahmed", age: 32, gender: "male" },
    { id: 2, name: "mohamed", age: 40, gender: "female" },
    { id: 3, name: "dalia", age: 26, gender: "female" },
];
class userfields {
    constructor() { }
    query = () => {
        return {
            getuser: {
                type: user_type_1.userType,
                args: user_args_1.getuserargs,
                resolve: (parent, args) => {
                    return user_service_1.default.getuserqraphql(args);
                }
            },
            listusers: {
                type: new graphql_1.GraphQLList(user_type_1.userType),
                resolve: () => { return user_service_1.default.getusersgraphql(); }
            }
        };
    };
    mutation = () => {
        return {
            createuser: {
                type: new graphql_1.GraphQLList(user_type_1.userType),
                args: user_args_1.createuserargs,
                resolve: (parent, args) => {
                    const { id, name, age, gender } = args;
                    const userexist = users.find(user => user.id == id);
                    if (userexist) {
                        throw new global_error_handler_1.AppError("user already exist");
                    }
                    users.push({ id, name, age, gender });
                    return users;
                }
            }
        };
    };
}
exports.userfields = userfields;
exports.default = new userfields;
//# sourceMappingURL=user.fields.js.map