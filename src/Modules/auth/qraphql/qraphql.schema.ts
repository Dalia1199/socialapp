import {  GraphQLObjectType, GraphQLSchema } from "graphql";
import  userfields  from "../auth/qraphql/user.fields";

 export const qraphqlschema=new  GraphQLSchema({
    query:new GraphQLObjectType({
        name:"query",
        fields:{
            ...userfields.query()
        }

    }),
    mutation:new GraphQLObjectType({
        name:"mutation",
        fields:{
            ...userfields.mutation()
        }
    })
})