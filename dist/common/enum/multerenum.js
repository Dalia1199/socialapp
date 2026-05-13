"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multer_enum = exports.store_enum = void 0;
var store_enum;
(function (store_enum) {
    store_enum["disk"] = "disk";
    store_enum["memory"] = "memory";
})(store_enum || (exports.store_enum = store_enum = {}));
exports.multer_enum = {
    Image: ["image/png", "image/jpj", "image/web"],
    video: ["video/mp4"],
    pdf: ["application/pdf"]
};
//# sourceMappingURL=multerenum.js.map