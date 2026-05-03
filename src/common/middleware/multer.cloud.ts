import multer from "multer"
import { multer_enum, store_enum } from "../enum/multerenum"
import { tmpdir } from "node:os"
import { Request } from "express"



const multercloud = ({ store_type = store_enum.memory, custom_types=multer_enum.Image,
    maxfilesize=5*1024*1024
}: { 
    store_type?:store_enum ,
    custom_types?:string[],
    maxfilesize?:number
}={})=>{
const storage = store_type===store_enum.memory?multer.memoryStorage ():multer.diskStorage({
    destination:tmpdir(),
    filename: function (req:Request, file:Express.Multer.File, cb:Function) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})
    function fileFilter(req: Request, file: Express.Multer.File, cb: Function) {
        if (!custom_types.includes(file.mimetype)) {
            cb(new Error('invalid file type'))

        } else{
        cb(null, true)

    }
}


    const upload=multer({storage,fileFilter,limits:{fileSize:maxfilesize}})
    return upload
}
export default multercloud