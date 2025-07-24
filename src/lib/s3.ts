import { S3Client } from "@aws-sdk/client-s3";

// Validate required environment variables
if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION environment variable is required");
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID environment variable is required");
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY environment variable is required");
}

// Create and configure S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Export S3 bucket name for convenience
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME environment variable is required");
}

// Export common S3 configuration
export const S3_CONFIG = {
  bucket: S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
} as const;
