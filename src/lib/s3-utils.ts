import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "./s3";

/**
 * Upload a file to S3
 * @param key - The S3 object key (file path)
 * @param body - The file content (Buffer, Uint8Array, or string)
 * @param contentType - The MIME type of the file
 * @param metadata - Optional metadata for the object
 * @returns Promise with the upload result
 */
export async function uploadToS3({
  key,
  body,
  contentType,
  metadata = {},
}: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  metadata?: Record<string, string>;
}) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  });

  try {
    const result = await s3Client.send(command);
    return {
      success: true,
      key,
      etag: result.ETag,
      url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error}`);
  }
}

/**
 * Get a file from S3
 * @param key - The S3 object key (file path)
 * @returns Promise with the file data
 */
export async function getFromS3(key: string) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error("Error getting file from S3:", error);
    throw new Error(`Failed to get file from S3: ${error}`);
  }
}

/**
 * Delete a file from S3
 * @param key - The S3 object key (file path)
 * @returns Promise with the deletion result
 */
export async function deleteFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const result = await s3Client.send(command);
    return {
      success: true,
      key,
      deletionMarker: result.DeleteMarker,
    };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error}`);
  }
}

/**
 * Check if a file exists in S3
 * @param key - The S3 object key (file path)
 * @returns Promise<boolean> indicating if the file exists
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  const command = new HeadObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === "NotFound") {
      return false;
    }
    if (error && typeof error === 'object' && '$metadata' in error && 
        typeof error.$metadata === 'object' && error.$metadata && 
        'httpStatusCode' in error.$metadata && error.$metadata.httpStatusCode === 404) {
      return false;
    }
    console.error("Error checking file existence in S3:", error);
    throw new Error(`Failed to check file existence in S3: ${error}`);
  }
}

/**
 * Generate a presigned URL for uploading to S3
 * @param key - The S3 object key (file path)
 * @param contentType - The MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise with the presigned URL
 */
export async function getPresignedUploadUrl({
  key,
  contentType,
  expiresIn = 3600,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return {
      success: true,
      url,
      key,
      expiresIn,
    };
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    throw new Error(`Failed to generate presigned upload URL: ${error}`);
  }
}

/**
 * Generate a presigned URL for downloading from S3
 * @param key - The S3 object key (file path)
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise with the presigned URL
 */
export async function getPresignedDownloadUrl({
  key,
  expiresIn = 3600,
}: {
  key: string;
  expiresIn?: number;
}) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return {
      success: true,
      url,
      key,
      expiresIn,
    };
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    throw new Error(`Failed to generate presigned download URL: ${error}`);
  }
}

/**
 * Generate a unique file key with timestamp and random suffix
 * @param originalName - The original filename
 * @param prefix - Optional prefix for the key (e.g., 'avatars/', 'documents/')
 * @returns A unique S3 key
 */
export function generateUniqueKey(originalName: string, prefix = ""): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "-");

  return `${prefix}${timestamp}-${randomSuffix}-${baseName}.${extension}`;
}

/**
 * Get the public URL for an S3 object
 * @param key - The S3 object key
 * @returns The public URL (only works if bucket/object is public)
 */
export function getPublicUrl(key: string): string {
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}
