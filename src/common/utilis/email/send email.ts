import  nodemailer from "nodemailer";
import { Email, password } from "../../../conflig/conflig.service";
import Mail from "nodemailer/lib/mailer";

export const sendemail=async(mailoptions:Mail.Options)=>{
const transporter =  nodemailer.createTransport({
  
    service: "gmail",
   
    auth: {
        user: Email,
        pass: password,
    },
});

    const info = await transporter.sendMail({
        from: `"dalia"<${Email}>`,
        ...mailoptions
            });        
    

    console.log("Message sent:", info.messageId);
    return info.accepted.length>0?true:false;
}
export const generateotp=async ()=>{
    return Math.floor(Math.random()*90000*10000);
}