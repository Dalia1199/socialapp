"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availability_enum = exports.allow_comment_enum = void 0;
var allow_comment_enum;
(function (allow_comment_enum) {
    allow_comment_enum["allow"] = "allow";
    allow_comment_enum["deny"] = "deny";
})(allow_comment_enum || (exports.allow_comment_enum = allow_comment_enum = {}));
var availability_enum;
(function (availability_enum) {
    availability_enum["puplic"] = "puplic";
    availability_enum["only_me"] = "only_me";
    availability_enum["friends"] = "friends";
})(availability_enum || (exports.availability_enum = availability_enum = {}));
