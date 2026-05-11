"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3service = void 0;
const conflig_service_1 = require("../../conflig/conflig.service");
const multerenum_1 = require("../enum/multerenum");
const node_fs_1 = __importDefault(require("node:fs"));
const global_error_handler_1 = require("../utilis/global-error-handler");
const client_s3_1 = require("@aws-sdk/client-s3");
const node_crypto_1 = require("node:crypto");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class s3service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: conflig_service_1.AWS_REGION,
            credentials: {
                accessKeyId: conflig_service_1.AWS_ACCESS_KEY,
                secretAccessKey: conflig_service_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadfile({ file, store_type = multerenum_1.store_enum.memory, path = "General", ACL = client_s3_1.ObjectCannedACL.private }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            ACL,
            Key: `social_media_app_2/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
            Body: store_type === multerenum_1.store_enum.memory ? file.buffer : node_fs_1.default.createReadStream(file.path),
            ContentType: file.mimetype
        });
        if (!command.input.Key) {
            throw new global_error_handler_1.AppError("fail to upload file ");
        }
        await this.client.send(command);
        return command.input.Key;
    }
    async uploadlargefile({ file, store_type = multerenum_1.store_enum.disk, path = "General", ACL = client_s3_1.ObjectCannedACL.private }) {
        const command = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: conflig_service_1.AWS_BUCKET_NAME,
                ACL,
                Key: `social_media_app_2/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`,
                Body: store_type === multerenum_1.store_enum.memory ? file.buffer : node_fs_1.default.createReadStream(file.path),
                ContentType: file.mimetype
            }
        });
        const result = await command.done();
        command.on("httpUploadProgress", (Progress) => {
            console.log(Progress);
        });
        return result.Key;
    }
    async uploadfiles({ files, store_type = multerenum_1.store_enum.memory, path = "General", ACL = client_s3_1.ObjectCannedACL.private, islarge = false }) {
        let urls = [];
        if (islarge) {
            urls = await Promise.all(files.map((file) => {
                return this.uploadlargefile({ file, store_type, ACL, path });
            }));
        }
        else {
            urls = await Promise.all(files.map((file) => {
                return this.uploadfile({ file, store_type, ACL, path });
            }));
        }
        return urls;
    }
    async CreatePresignedUrl({ path, Filename, ContentType, expiresIn = 60 }) {
        const key = `social_media_app/${path}/${(0, node_crypto_1.randomUUID)()}_${Filename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Key: key,
            ContentType
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, key };
    }
    async getfile(Key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Key
        });
        return await this.client.send(command);
    }
    async getfiles(foldername) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Prefix: `social_media_app_2/${foldername}`
        });
        return await this.client.send(command);
    }
    async deletefile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Key: key
        });
        return await this.client.send(command);
    }
    async deletefiles(keys) {
        const keymapped = keys.map((k) => {
            return { Key: k };
        });
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Delete: {
                Objects: keymapped,
                Quiet: false
            },
        });
        return await this.client.send(command);
    }
    async deletefolder(foldername) {
        const data = await this.getfiles(foldername);
        const keymapped = data?.Contents?.map((k) => {
            return k.Key;
        });
        return await this.deletefiles(keymapped);
    }
    async getpresignurl({ key, expiresIn = 60, download }) {
        console.log(download, "downlad");
        const command = new client_s3_1.GetObjectCommand({
            Bucket: conflig_service_1.AWS_BUCKET_NAME,
            Key: key, // FIX: was Key (undefined), use key parameter
            ResponseContentDisposition: `attachment;filename="${key.split("/").pop()}"`
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
}
exports.s3service = s3service;
