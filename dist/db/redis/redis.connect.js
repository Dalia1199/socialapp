"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionRedis = exports.redisclient = void 0;
const redis_1 = require("redis");
const conflig_service_1 = require("../../conflig/conflig.service");
exports.redisclient = (0, redis_1.createClient)({
    url: conflig_service_1.redisurl,
});
const connectionRedis = async () => {
    await exports.redisclient.connect().then(() => {
        console.log(" Connected to Redis successfully");
    }).catch((err) => {
        console.log("failed to connect to Redis:", err);
    });
};
exports.connectionRedis = connectionRedis;
