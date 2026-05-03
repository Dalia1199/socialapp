 import express, { NextFunction,Request,response } from "express";
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
 const app:express.Application =express();
 const port:number =Number(Port)

 const bootstrap=()=>{

    const limter=rateLimit({
        windowMs:15*60*1000,
        max:100,
        message:"too many requests from this ip,please try again later",
        handler:(req:Request,res:Response,next:NextFunction)=>{
            // res.status(429).json({message: "too many requests from this ip,please try again later"
            // })
            throw new AppError(`too many requests from this ip,please try again later`,429)
        },
        legacyHeaders:false
    })
     app.use(express.json())

    app.use(cors(),helmet(),limter)
    app.get("/",(req:Request,res:Response,next:NextFunction)=>{
        res.status(200).json({message:"welcome on socialmedia app 😊😊"})

    })
    //mongoose hooks
    // async function test(){
    //     const user =new usermodel({
    //         username:"dalia",
    //         email: `${Date.now()}@gmail.com`,
    //         password:"123",
        
    //         age:26,})
    //     await user.save()
    //     test()

             
    // }
     app.use("/auth", authRouter)

     app.get("/upload",async(req:Request,res:Response,next:NextFunction)=>{
        const {foldername}=req.query as{foldername}
        console.log({foldername});
        let result =await new s3service().getfiles(foldername)
        let resultmapped=result.contents?.map((file)=>{
            return {key:file.key}
        })
        successresponse({res,data:resultmapped})
     })
     //delete
     app.get("/upload", async (req: Request, res: Response, next: NextFunction) => {
         const { Key } = req.query as { Key :string}
         console.log({ Key });
         let result = await new s3service().deletefile(Key)
        
         })
         successresponse({ res, data: result })
     //delte files
app.get("/upload", async (req: Request, res: Response, next: NextFunction) => {
  const {foldername}=req.body as {foldername:string}
  let result await new s3service().deletefolder(foldername)
successresponse({ res, data: result })
     })



     app.get("/upload/pre-signed/*path",async(req:Request,res:Response,next:NextFunction)=>{
        const{path}=req.params as{path:string[]}
        const {download}=req.query as {downlload:string}
        const key=path.join("/")
        const url=await new s3service().getpresignurl({key,download})
        successresponse({res,data:url})
     })

app.get("/upload/*path",async(req:Request,res:Response,next:NextFunction)=>{
    const {path}=req.params as {path:string[]}
    const {download}=req.query
    const Key=path.join("/") as string
    const result=await new s3service().getfile(Key)
const stream=result.body as NodeJs.Readablestream
res.setHeader("Content-type",result.ContentType!)

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (download &&download=== "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
}
    await Pipeline(stream,res)
    
})
     checkconnection()
redisService.connect()







    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        // throw new Error(`url ${req.originalUrl}with method ${req.method} not found`,{cause:404})
        throw new AppError( "url not found", 404 )
    })
     app.use(globalerrorhandler)

app.listen(port,()=>{
    console.log(`server is running on port${port}`)
})
}
export default bootstrap


