 import express, { NextFunction,Request,Response } from "express";
 import cors from "cors"
 import helmet from "helmet";
 import {rateLimit,RateLimitRequestHandler} from "express-rate-limit"
import { Port} from "./conflig/conflig.service";
import { globalerrorhandler,AppError } from "./common/utilis/global-error-handler";
import authRouter from "./Modules/auth/user.controller";
import { checkconnection } from "./db/connectiondb";
import redisService from "./common/service/redis.service";
import usermodel from "./db/models/user.model";
import { s3service } from "./common/service/s3.servics";
import { successresponse } from "./common/utilis/response.success";
import {pipeline } from "stream/promises";
import path from "path";
import postrouter from "./Modules/posts/post.controller";
import storyrouter from "./Modules/story/story.controller";
import notificationrouter from "./Modules/notifications/notification.controller";
import { qraphqlschema } from "./Modules/auth/qraphql/qraphql.schema";
// import notificationService from "./common/service/notification.service";
import { createHandler } from 'graphql-http/lib/use/http';
import socketGetway from "./Modules/realtime/socket.getway";
import { decoded_and_fetchuser } from "./common/middleware/authentication";

 const app:express.Application =express();
 //application:type of express
 const port:number =Number(Port)

 const bootstrap= async()=>{

    const limter=rateLimit({
        windowMs:15*60*1000,
        max:100,
        message:"too many requests from this ip,please try again later",
        handler:(req:Request,res:Response,next:NextFunction)=>{
            
            throw new AppError(`too many requests from this ip,please try again later`,429)
        },
        legacyHeaders:false
    })
     app.use(express.json())

    app.use(cors(),helmet(),limter)
     app.get("/", (req: Request, res: Response, next: NextFunction)=>{
        res.status(200).json({message:"welcome on socialmedia app 😊😊"})
    })
    // app.post("/send-notification",(req:Request,res:Response,next:NextFunction)=>{
    //     notificationService.sendnotification({
    //         token:req.body.token,
    //         data:{
    //             title:"welcome to social app",
    //             body:"have agood day"
    //         }

    //      })
    //     console.log({token:req.body.token});
    // })

    
     

     app.get("/upload",async(req:Request,res:Response,next:NextFunction)=>{
        const {foldername}=req.query as{foldername:string}
        console.log({foldername});
        let result =await new s3service().getfiles(foldername)
        let resultmapped=result.Contents?.map((file)=>{
            return {key:file.Key}
        })
        successresponse({res,data:resultmapped})
     })
     //delete
     app.get("/upload-file", async (req: Request, res: Response, next: NextFunction) => {
         const { Key } = req.query as { Key :string}
         console.log({ Key });
         let result = await new s3service().deletefile(Key)
         successresponse({ res, data: result })

         })
     //delte files
     app.get("/upload-files", async (req: Request, res: Response, next: NextFunction) => {
     const {foldername}=req.body as {foldername:string}
     let result = await new s3service().deletefolder(foldername) 
     successresponse({ res, data: result })
     })



     app.get("/upload/pre-signed/*path",async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as{path:string[]}
         const { download } = req.query as { download:string}
        const key=path.join("/")
        const url=await new s3service().getpresignurl({key,download})
        successresponse({res,data:url})
     })

app.get("/upload/*path",async(req:Request,res:Response,next:NextFunction)=>{
    const {path}=req.params as {path:string[]}
    const {download}=req.query
    const Key=path.join("/") as string
    const result=await new s3service().getfile(Key)
    const stream = result.Body as NodeJS.ReadableStream
res.setHeader("Content-type",result.ContentType!)

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (download &&download=== "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
}
    await pipeline(stream,res)
    
})
     checkconnection()
    //  await redisService.connect()

     app.use("/auth", authRouter)
     app.use("/posts",postrouter)
     app.use("/stories", storyrouter)          
     app.use("/notifications", notificationrouter)

     app.use("/graphqql", createHandler({ schema: qraphqlschema,context:(req)=>({req})}))


    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        // throw new Error(`url ${req.originalUrl}with method ${req.method} not found`,{cause:404})
        throw new AppError( "url not found", 404 )
    })
     app.use(globalerrorhandler)
     io.use(async(socket,next)=>{
        console.log("socket");
        const{user}=await decoded_and_fetchuser(socket.handshake.auth.authorization)
     })
  io.on("connection",(socket)=>{
    console.log(socket.id);

  })
app.listen(port,()=>{
    console.log(`server is running on port${port}`)
})
     const httpserver = app.listen(port, () => {
         console.log(`server is running on port${port}`)
     });
     await socketGetway.initio(httpserver)


}
export default bootstrap


