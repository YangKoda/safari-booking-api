import { S3Client } from '@aws-sdk/client-s3';

export class S3Config {
  private static instance: S3Client | null = null;

  static getClient(): S3Client {
    if (!this.instance) {
      const region = process.env.AWS_REGION;
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error(
          'Missing required AWS S3 configuration: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY'
        );
      }

      this.instance = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    return this.instance;
  }

  static getBucketName(): string {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error('Missing required AWS S3 configuration: AWS_S3_BUCKET');
    }
    return bucket;
  }

  static getBaseUrl(): string {
    const baseUrl = process.env.AWS_S3_BASE_URL;
    if (!baseUrl) {
      throw new Error('Missing required AWS S3 configuration: AWS_S3_BASE_URL');
    }
    return baseUrl;
  }
}
