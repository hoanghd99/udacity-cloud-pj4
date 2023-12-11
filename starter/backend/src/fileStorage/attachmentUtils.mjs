import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3BucketTodos = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = 300;

export class AttachmentUtils {

    constructor() {
        this.s3Client = new S3Client();
        this.bucketTodos = s3BucketTodos; 
    }

    getAttachmentUrl(todoId) {

        const attachUrl = `https://${this.bucketTodos}.s3.amazonaws.com/${todoId}`;
        return attachUrl;
    }

    getUploadUrl(todoId) {
        const command = new PutObjectCommand({
            Bucket: s3BucketTodos,
            Key: todoId
        });
        
        const uploadUrl = getSignedUrl(this.s3Client, command, {
            expiresIn: urlExpiration
        });

        return uploadUrl;
    }
}