"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventemitter = void 0;
const node_events_1 = require("node:events");
const event_enum_1 = require("../../enum/event.enum");
exports.eventemitter = new node_events_1.EventEmitter();
exports.eventemitter.on(event_enum_1.EventEnum.confirmemail, async (fn) => {
    await fn();
});
