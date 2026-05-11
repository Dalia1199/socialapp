


// createcomment=async(req:Request,res:Response,next:nextfunction)=>{
//     const{contwent,tags}:createcommentdto=req.body
//     const{postid}=req.params
//     const  post=await this._postrepo.findOne({
//         filter:{
//             _id:postid,$or:[
//                 ...postavalibility(req)

//             ],
//             aloowcomment:allowc0mment_enum.alow
//         }
//     })
//     if (!post){
//         throw new AppErrorCodes("post not found or you are not allowed to comment on this post",404)

//     }
//     let mentions:Types.objectId[]
//     let fcmtokens:string[]=[]
//     if(tags?.length){
//         _id:{$in:tags}
//     }
// })
// if (mentionedtags.length!==tags.length){
//     throw new AppErrorCodes("invalid tag id")
// }
// for (const tag of mentinedtags){
//     mentions.push(tag._id);
// (await this ._redisservice.getfcms(tag._id)).mapp((token)=>{
//     fcmtokens.push(token)
// })
// let urls:string[]=[];
// if(req.files){
//     urls=await this._s3service.uploadfiles({
//         files:req.files as Express.Multer.file[],
//         path:`users/${req?.user?._id/posts/$post.folderid}`
//     })
// }
// createreply=async(req:Request,res:Response,next:NextFunction)=>{
//     const{content,tags}:createcommentdto=req.body
//     const{postid,commentid}=req.params
//     const comment=await this._commentrepo.findOne({
//         filter:{
//             _id:commentid,
//             postid:postid!,
//         },
//         options:{
//             populate:[
//                 {path:"postid",
//                     match:{$or:[
//                         ...postavalibility(req)
//                     ],
//                 allowcomment:allowc0mment_enum.allow}
//                 }
//             ]
//         }
//     })
//     if(!comment?.postid){
//         throw new AppErrorCodes("tcomment not found or you are not allowed to comment on this post",404)
//     }
// }
// let mentions:Types.objectId[]

// }

