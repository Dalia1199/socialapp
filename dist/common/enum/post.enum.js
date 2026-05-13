"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onmodel_enum = exports.availability_enum = exports.allow_comment_enum = void 0;
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
var onmodel_enum;
(function (onmodel_enum) {
    onmodel_enum["post"] = "post";
    onmodel_enum["comment"] = "comment";
})(onmodel_enum || (exports.onmodel_enum = onmodel_enum = {}));
//# sourceMappingURL=post.enum.js.map