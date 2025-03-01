import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

class AwsS3FileStoreAdapter implements FileStorePort {
  private s3: S3Client;
  private bucketName: string;

  constructor(bucketName: string, region: string) {
    this.s3 = new S3Client({ region }); // Altere para sua região
    this.bucketName = bucketName;
  }

  async get(id: string): Promise<File> {
    try {
      const response = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: id,
      }));

      if (!response.Body) {
        throw new Error("File not found in S3");
      }

      const fileBlob = new Blob([await response.Body.transformToByteArray()]);
      return new File([fileBlob], id);
    } catch (error) {
      throw new Error(`Error retrieving file from S3: ${error.message}`);
    }
  }

  async set(id: string, file: Buffer<ArrayBuffer>, contentType: string): Promise<string> {
    try {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: id,
        Body: file,
        ContentType: contentType,
      }));

      return `http://${this.bucketName}.s3.amazonaws.com/${id}`
    } catch (error) {
      throw new Error(`Error uploading file to S3: ${error.message}`);
    }
  }
}


export default AwsS3FileStoreAdapter