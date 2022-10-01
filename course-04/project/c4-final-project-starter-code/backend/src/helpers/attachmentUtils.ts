import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })

  
export function getUploadUrl(key: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: key,
        Expires: urlExpiration
    })
}

export function getReadUrl(key: string) {
    const url : string = "https://" + bucketName + ".s3.amazonaws.com/" + key
    return url
}
