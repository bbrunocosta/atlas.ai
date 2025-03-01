import * as dotenv from 'dotenv'
dotenv.config()

export default {
  region: process.env.AWS_S3_REGION,
  bucket: process.env.AWS_S3_BUCKET_NAME
}