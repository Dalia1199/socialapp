import { NextFunction, Request, Response } from "express";
import { userRepository } from "../../db/repositry/user repository ";
import { AppError } from "../../common/utilis/global-error-handler";
import { chatRepository } from "../../db/repositry/chatrepository";
import { successresponse } from "../../common/utilis/response.success";
import { randomUUID } from "node:crypto";
import { Server, Socket } from "socket.io";
import redisService from "../../common/service/redis.service";
import { populate } from "dotenv";
import { Types } from "mongoose";

class chatservice{
    private readonly _usermodel=new userRepository()
    private readonly _chatrepo = new chatRepository()


    constructor(){}
    //restapis 
    //socket.io

getchat=async (req:Request,res:Response,nex:NextFunction)=>{
    const{userid}=req.params
    let {page,limit=5}=req.query as unknown as {page:number,limit:number}
    if(page<0||!page)page=1
    page=page*1||1
    limit=limit*1||5
const  chat =await this._chatrepo.findOne({

        participants:{
            $all:[req.user._id,userid]
        },
            group:{$exists:false}
    },{
        messages:{
       $slice:[-(page*limit),limit]
        }


    },{
        populate:[{
            path:"paticipants"
        }]
    })
if(!chat){
    throw new AppError("chat not found",400)
}

successresponse({res,message:"done",data:chat})
}


    getgroupchat = async (req: Request, res: Response, nex: NextFunction) => {
        const {groupid } = req.params
        // let { page, limit = 5 } = req.query as unknown as { page: number, limit: number }
        // if (page < 0 || !page) page = 1
        // page = page * 1 || 1
        // limit = limit * 1 || 5
        const chat = await this._chatrepo.findOne({
_id:groupid,
            participants: {
$in: [req?.user?._id]           },
            group: { $exists: true}
          

        }, {
            populate: [{
                path: "messaes.createdby"
            }]
        })
        if (!chat) {
            throw new AppError("chat not found", 400)
        }

        successresponse({ res, message: "done", data: chat })
    }

 creategroupchat=async(req:Request,res:Response,next:NextFunction)=>{
    let {group,participants,groupimage}=req.body
    const createdby=req.user?._id as Types.ObjectId 
    const mappedusers=[...new set(participants.map((user:string)=>Types.objectid.createformhexstring(participants)))]as Types.objectId[]
    const users=await this._usermodel.find({
        filter:{
            _id:{$in:participants},
            friends:{$in:[req.user?._id]}
        },
    })
    if (users.length!==mappedusers.length){
        throw new AppError("SOME ID IS DUPLICATED")
    }
    let groupimkage=""
    const roomid=randomUUID()
    if(req.file){
        groupimage=await this._s3service.uploadfile({
            path:"chat",
            file:req.file
        })as string
    }
    mappedusers.push(req.user?._id)
    const chat =await this._chatrepo.create?({
        createdby:req.user?._id!
        group,groupimkage,
        messages:[],
        participants:mappedusers,
        roomid
    })
    if(!chat)throw new AppError("chat not created",400)
 }
successresponse({res,message:"done",data:chat})
}
    sayhi =(data: any,socket:Socket,io:server)=>{
            console.log({data});
            socket.emit("sayhiback",{message:"hi from be"})
    }
    join_room=async(data:any,socket:Socket,io:server)=>{
        console.log({data});
        const{roomid}=data
        const chat=await this._chatrepo.findOne({
            roomid,
            participants:{
                $in:[socket.data.user._id]
            },
            group:{$exists:true}
        })
        if(!chat){
            throw new AppError("CHAT NOT FOUND",404)
        }
        socket.join(chat?.roomid!)
    }

    sendmessage= async(data:any,socket:Socket,io:Server)=>{
const{sendto,content}=data
const createdby=socket.data.user._id
const user=await this._usermodel.findOne({
    filter:{_id:sendto}})
    if(!user)
        throw new AppError("usernot exist");
    const chat =await this._chatrepo.findOneandupdate({
        filter:{
            participants:{$all:[sendto,createdby]},
            group:{$exists:false}
        },
            update:{
                $push:{messages:{
                    content,createdby
                }}
            }
        if(!chat){
            await this._chatrepo.create({
                createdby,
                messages:[{content,createdby}]
            })
            participants:[sendto,createdby]
        }
    })
    io.to(await redisService.getsockets(createdby)).emit("successmessage",{content})
    io.to(await redisService.getsockets(sendto)).emit("newmessages",{content,from:socket.data.user})
}
sendgroupmessage = async (data: any, socket: Socket, io: Server) => {
    const { groupid, content } = data
    const createdby = socket.data.user._id
    
    const chat = await this._chatrepo.findOneandupdate({
        _id:groupid,

            participants: { $all: [ createdby] },
            group: { $exists: true }
        },
         {
            $push: {
                messages: {
                    content, createdby
                }
            }
        }
        if
        (!chat) {
            throw new AppError("CHAT NOT FOUND",404)
        }
    io.to(connectionsockets.get(createdby.tostring())!).emit("sucessmessage",{content})
    io.to(chat?.roomid!).emit("newmessage",{content,from:socket.data.user,groupid})



    // io.to(await redisService.getsockets(createdby)).emit("successmessage", { content })
    // io.to(await redisService.getsockets(sendto)).emit("newmessages", { content, from: socket.data.user })
}


export default new chatservice()