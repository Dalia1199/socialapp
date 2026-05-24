import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { AppError } from "../../../common/utilis/global-error-handler";
import { GenderType, userType } from "./user.type";
import { createuserargs, getuserargs } from "./user.args";
import userService from "../user.service";
import { authentication, authentication_qrarhql } from "../../../common/middleware/authentication";
import { authorization } from "../../../common/middleware/authorization";
import { validation_graphql } from "../../../common/middleware/validation";
import { getuserschema } from "../user.validation";

 let users=[
     {id:1,name:"ahmed",age:32,gender:"male"},
     {id:2,name:"mohamed",age:40,gender:"female"},
     {id:3,name:"dalia",age:26,gender:"female"},
 ]

export class userfields{
    constructor(){}
    query=()=>{
        return{
            getuser: {
                type: userType,
                args:{token:{type:new GraphQLNonNull(GraphQLString)}},
                resolve: async(parent: any, args: any,context:any) => {
                    await validation_graphql(getuserschema,args)
                    
                    const { user } = await authentication_qrarhql(args.token) 
                    await authorization(["admin"])
                    return userService.getuserqraphql(user._id)
                }
             
          
            },
            listusers: {
                type: new GraphQLList(userType),
                resolve: async(parent:any,args:any,context:any) => {
                    console.log({
                        raw: context.req.raw,
                        headers: context.req.headers

                    });
                     return userService.getusersgraphql()}
            }
        }
    }
    // mutation=()=>{
    //     return {
            // createuser: {
            //     type: new GraphQLList(userType),
            //     args: createuserargs,
            //     resolve: (parent:any, args:any) => {
            //         const { id, name, age, gender } = args
            //         const userexist = users.find(user => user.id == id)
            //         if (userexist) {
            //             throw new AppError("user already exist")
            //         }
            //         users.push({ id, name, age, gender })
            //         return users
            //     }
            // }
// }
//     }
// }
}
export default new userfields