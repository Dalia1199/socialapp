"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerenum = exports.RoleEnum = exports.GenderEnum = void 0;
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
    RoleEnum["superadmin"] = "superadmin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.providerenum = {
    system: "system",
    google: "google"
};
