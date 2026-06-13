import { Server, Socket } from "socket.io";
import {chatEvents} from "./chatEvent"

 export class chatgatway{
    private _chatevents:chatEvents=new chatEvents()
    constructor(){}
    registerevent=async(Socket:Socket,io:Server)=>{

        this._chatevents.sayhi(Socket,io)
        this._chatevents.sendmessage(socket,io)
        this._chatevents.join_room(socket, io)
        this._chatevents.sendgroupmessage(socket,io)

    }
}
export default new chatgatway()