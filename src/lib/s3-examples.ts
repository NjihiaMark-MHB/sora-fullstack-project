/**
 * Example usage of the S3 client and utilities
 * This file demonstrates common S3 operations
 */

import {
  deleteFromS3,
  fileExistsInS3,
  generateUniqueKey,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  getPublicUrl,
  uploadToS3,
} from "./s3-utils";

// Example: Upload a user avatar
export async function uploadUserAvatar(
  userId: string,
  file: Buffer,
  contentType: string
) {
  const key = generateUniqueKey(`avatar-${userId}.jpg`, "avatars/");

  try {
    const result = await uploadToS3({
      key,
      body: file,
      contentType,
      metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      avatarUrl: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return {
      success: false,
      error: "Failed to upload avatar",
    };
  }
}

// Example: Generate presigned URL for client-side upload
export async function generateAvatarUploadUrl(
  userId: string,
  contentType: string
) {
  const key = generateUniqueKey(`avatar-${userId}`, "avatars/");

  try {
    const result = await getPresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300, // 5 minutes
    });

    return {
      success: true,
      uploadUrl: result.url,
      key,
      publicUrl: getPublicUrl(key),
    };
  } catch (error) {
    console.error("Failed to generate upload URL:", error);
    return {
      success: false,
      error: "Failed to generate upload URL",
    };
  }
}

// Example: Download a file with presigned URL
export async function getFileDownloadUrl(key: string) {
  try {
    // Check if file exists first
    const exists = await fileExistsInS3(key);
    if (!exists) {
      return {
        success: false,
        error: "File not found",
      };
    }

    const result = await getPresignedDownloadUrl({
      key,
      expiresIn: 3600, // 1 hour
    });

    return {
      success: true,
      downloadUrl: result.url,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    console.error("Failed to generate download URL:", error);
    return {
      success: false,
      error: "Failed to generate download URL",
    };
  }
}

// Example: Clean up old user files
export async function deleteUserFiles(userId: string, fileKeys: string[]) {
  console.log(userId, fileKeys);
  const results = [];

  for (const key of fileKeys) {
    try {
      const result = await deleteFromS3(key);
      results.push({
        key,
        success: true,
        deletionMarker: result.deletionMarker,
      });
    } catch (error) {
      console.error(`Failed to delete file ${key}:`, error);
      results.push({
        key,
        success: false,
        error: `Failed to delete file: ${error}`,
      });
    }
  }

  return results;
}

// Example: Batch file operations
export async function batchUploadFiles(
  files: Array<{
    key: string;
    body: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
  }>
) {
  const results = [];

  for (const file of files) {
    try {
      const result = await uploadToS3(file);
      results.push({
        ...result,
        originalKey: file.key,
      });
    } catch (error) {
      console.error(`Failed to upload file ${file.key}:`, error);
      results.push({
        success: false,
        originalKey: file.key,
        error: `Failed to upload: ${error}`,
      });
    }
  }

  return results;
}
