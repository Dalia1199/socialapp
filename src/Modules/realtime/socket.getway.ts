import { IosApp } from "firebase-admin/project-management"
import redisService from "../../common/service/redis.service"
import { Server } from "socket.io"
import { Server as Httpserver} from "http"
import chatGateway from "../chat/realtime/chat.gateway"


class socketgetway{
    constructor(){}
    initio=async(httpserver:Httpserver)=>{
        const io=new Server(httpserver,{
            cors:{
                origin:"*"
            }
        })
        io.use(async(socket,next)=>{
            try{
                const{user}=await decodetoken_and_fetchuser(
                    socket.handshake.auth.authorization||socket.handshake.headers.authorization
                )
                socket.data.user=user
                next()
            } catch (error:any){
                next(error)
            }
        })
        io.on("connection",async(socket)=>{
            redisService.addsocket({userid:socket.data.user._id,socketID:socket.id})
           await chatGateway.registerevent(socket,io)
            console.log({usersocketids:await redisService.getsockets(socket.data.user.user._id)});

            socket.on("disconnect",async()=>{
                await redisService.removesocket({userid:socket.data.user._id,socketID:socket.id})
                console.log({usersocketidafterdisconnect:await redisService.getsockets(socket.data.user._id)})
            })
        })
    }
}
export default new socketgetway()