import mongoose from "mongoose";
import { mongourl } from "../conflig/conflig.service";


export const checkconnection=async()=>{
    try{
        await mongoose.connect(mongourl)
        console.log(`databaseconnected successfuly${mongourl}`)
    } catch (error){
        console.log(error)
    }

}