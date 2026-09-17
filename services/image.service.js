import { deleteS3Object, getImageUploadURL } from "../utils/aws-s3.js";

export const getImageUploadURLService = async (userId, contentType) => {
  const bucket = process.env.AWS_BUCKET_NAME;

  const key = `${userId}/profilePic/profilePic.jpeg`;

  const uploadUrl = await getImageUploadURL(bucket, key, contentType, 60);

  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
  };
};

export const deleteProfileImageService = async (userId) => {
  const bucket = process.env.AWS_BUCKET_NAME;

  const key = `${userId}/profilePic/profilePic.jpeg`;

  console.log("Deleting S3 object:", {
    bucket,
    key,
  });

  await deleteS3Object(bucket, key);

  console.log("S3 object deleted:", key);
};
