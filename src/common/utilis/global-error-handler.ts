import  type {Request,Response,NextFunction} from "express";
 export class AppError extends Error {
    constructor(public message: any,  public statuscode: number=500) {
        super(message)
        this.message=message
        this.statuscode=statuscode

    }
}

export const globalerrorhandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    // console.log(err.cause)
    const status = err.statuscode as number || 500
    res.status(status).json({ message: err.message, status, stack: err.stack })
}