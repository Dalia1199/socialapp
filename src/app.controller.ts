 import express, { NextFunction,Request,response } from "express";
 import cors from "cors"
 import helmet from "helmet";
 import {rateLimit,RateLimitRequestHandler} from "express-rate-limit"
import { Port} from "./conflig/conflig.service";
import { globalerrorhandler,AppError } from "./common/utilis/global-error-handler";
import authRouter from "./Modules/auth/user.controller";
import { checkconnection } from "./db/connectiondb";
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
     app.use("/auth", authRouter)

     checkconnection()








    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        // throw new Error(`url ${req.originalUrl}with method ${req.method} not found`,{cause:404})
        throw new AppError( )
    })
     app.use(globalerrorhandler)

app.listen(port,()=>{
    console.log(`server is running on port${port}`)
})
}
export default bootstrap


