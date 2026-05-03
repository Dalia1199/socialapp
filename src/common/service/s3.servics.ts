import { file, object, promise, string } from "zod"
import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../conflig/conflig.service"
import { store_enum } from "../enum/multerenum"
import  fs from "node:fs"
import { AppError } from "../utilis/global-error-handler"
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectAclCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, Progress$, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { Upload } from "@aws-sdk/lib-storage"
import path from "node:path"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export class s3service{
    private client:S3Client
    constructor(){
        this.client=new S3Client({
            region:AWS_REGION,
            credentials:{
                accessKeyId:AWS_ACCESS_KEY,
                secretAccessKey:AWS_SECRET_ACCESS_KEY
            }
        })

    }
    async uploadfile({
        file,
        store_type =store_enum.memory,
        path="General" ,
        ACL=ObjectCannedACL.private
            
        
    }:{
        file:Express.Multer.File,
        store_type ?:store_enum,
        path?:string,
        ACL?:ObjectCannedACL
    }):Promise<string>{
        const command=new PutObjectCommand({
            Bucket:AWS_BUCKET_NAME,
            ACL,
            Key:`social_media_app_2/${path}/${randomUUID()}_${file.originalname}`,
            Body:store_type===store_enum.memory?file.buffer:fs.createReadStream(file.path),
            ContentType:file.mimetype
        })
        if(!command.input.Key){
            throw new AppError("fail to upload file ")
        }

        await this.client.send(command)
        return command.input.Key
    }
    async uploadlargefile({
        file,
        store_type =store_enum.disk,
        path = "General",
        ACL = ObjectCannedACL.private


    }: {
        file: Express.Multer.File,
        store_type?: store_enum.memory,
        path?: string,
        ACL?: ObjectCannedACL
    }): Promise<string> {
        const command = new Upload({
            client:this.client,
            params:{
            Bucket: AWS_BUCKET_NAME,
            ACL,
            Key: `social_media_app_2/${path}/${randomUUID()}_${file.originalname}`,
            Body: store_type === store_enum.memory ? file.buffer : fs.createReadStream(file.path),
            ContentType: file.mimetype
            }
        })
       

      const result =await command.done()
      command.on("httpUploadProgress",(Progress)=>{
        console.log(Progress);
      });
        return result.Key as string
    } 
    async uploadfiles({
        files,
        store_type = store_enum.memory,
        path = "General",
        ACL = ObjectCannedACL.private,
        islarge=false


    }: {
        files: Express.Multer.File[],
        store_type?: store_enum,
        path?: string,
        ACL?: ObjectCannedACL,
        islarge?:boolean
    }){
        let urls:string[]=[]
        if(islarge){

         urls=await Promise.all(files.map((file) => {
            return this.uploadlargefile({file,store_type,ACL,path})
        }))
    } else{
            urls = await Promise.all(files.map((file) => {
                return this.uploadfiles({ files, store_type, ACL, path })
            }))

    }
    return urls
}
async CreatePresignedUrl({
path,
Filename,
ContentType,
expiresIn=60
}:{
    path:string,
    Filename:String,
    ContentType:string,
expiresIn?:number
}){
    const key =`social_media_app/${path}/${randomUUID()}_${Filename}`
    const command=new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key,
        ContentType

    })
    const url=await getSignedUrl(this.client,command,{expiresIn})
    return{url,key}
}
    async getfile(Key: String){
        const command=new GetObjectAclCommand({
            Bucket:AWS_BUCKET_NAME,
            Key
        })
        return await this.client.send(command)
    }
    async getfiles(foldername: String) {
        const command = new ListObjectsV2Command({
            Bucket: AWS_BUCKET_NAME,
            Prefix:`social_media_app_2/${foldername}`
        })
        return await this.client.send(command)
    }
    async deletefile(key: String) {
        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            key
        })
        return await this.client.send(command)
    }
    async deletefiles(keys: String[]) {
        const keymapped=keys.map((k)=>{
            return {Key:k}
        })
        const command = new DeleteObjectsCommand({
            Bucket: AWS_BUCKET_NAME,
            Delete:{
                Objects:keymapped,
                Quiet:false
            },
        })
        return await this.client.send(command)
    }
    async deletefolder(foldername: String) {
        const data=await this.getfiles(foldername)
        const keymapped = data?.Contents?.map((k) => {
            return k.Key
        })
       
        return await this.deletefiles(keymapped as string[])
    }
    async getpresignedurl({
        key,
        expiresIn=60,
        download
    }:{
        Key:string,
            expiresIn?:number,
            downlad?:string|undefined
        
    }){
        console.log(download,"downlad");
        const command =new GetObjectCommand({
            Bucket:AWS_BUCKET_NAME,
            Key,
            ResponseContentDisposition:`attachment;filename="${key.split("/").pop()}"`
        })
  const url=await getSignedUrl(this.client,command,{expiresIn})
  return url
}

}


