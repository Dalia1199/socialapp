import Jwt, {  JwtPayload, Secret, SignOptions } from "jsonwebtoken";

 class TokenService {
    constructor() {}
         generatetoken = ({
            payload, secret_key, options
        }: {
            payload: object, secret_key: Secret,
            options?: SignOptions,

        }): string => {
            return Jwt.sign(payload, secret_key, options)
        }

         verifytoken = ({
            token,
            secret_key,
        }: {
            token: string,
            secret_key: Secret
        }): JwtPayload => {
            return Jwt.verify(token, secret_key) as JwtPayload
        }
    }
    export default new TokenService()
