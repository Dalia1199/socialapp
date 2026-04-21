import { EventEmitter } from "node:events";
import { EventEnum } from "../../enum/event.enum";
 export const eventemitter=new EventEmitter()
 eventemitter.on(EventEnum.confirmemail,async(fn)=>{
    await fn()
 })