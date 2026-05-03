import admin from "firebase-admin";
import { readFileSync } from "fs";
import {resolve} from "node:path"
import { promise } from "zod/mini";
class notifictionservice{

    private readonly client :admin.app.App

    constructor(){

        const  serviceAccount = JSON.parse(readFileSync(resolve(__dirname, "../../conflig/social-app-cb578-firebase-adminsdk-fbsvc-3594383195.json")) as unknown as string)

        this.client=admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    async sendnotification({token,data}:{token:string,data:{title:string,body:string}}){
    const message = {
        token,data
    }
    return await this.client.messaging().send(message)
}
    async sendnotifications({ tokens, data }: { token: string[], data: { title: string, body: string } })
    {
    
await promise.all(tokens.map((token) =>{
    return this.sendnotifications({token,data})
}) )   
}

}
export default new notifictionservice()