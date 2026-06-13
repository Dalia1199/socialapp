import { Server, Socket } from "socket.io";
import chatService from "../chat/chat.service";

class chatevent{
    private _chatservice:chatservice=new chatService()
    constructor(){}
    sayhi=async(socket:Socket,io:server)=> {
        socket.on("sayhi",(data)=>{
            this._chatservice.sayhi(data,socket,io)
        })
    }
    sendmessage = async (socket: Socket,io:Server) => {
        socket.on("sendmessage", (data) => {
            this._chatservice.sendmessage(data,socket,io)
        })
    }
    join_room=(socket:Socket,io:Server)=>{
        socket.on("join_room",(data)=>{
            this._chatservice.join_room(data,socket,io)
        })
    

}
    sendgroupmessage = (socket: Socket, io: Server) => {
        socket.on("join_room", (data) => {
            this._chatservice.sendgroupmessage(data, socket, io)
        })


    }
}
