import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Check for empty details of video or thumbnail
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Upload thumbnail and video to server local storage
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  const videoLocalPath = req.files?.videoFile[0]?.path;

  // Check thumbnail and video both were uploaded
  if (!(thumbnailLocalPath || videoLocalPath))
    throw new ApiError(400, "Video and thumbnail both are required.");

  // Upload thumbnail and video to cloudinary
  const thumbnailCloudinary = await uploadToCloudinary(thumbnailLocalPath);
  const videoCloudinary = await uploadToCloudinary(videoLocalPath);

  if (!(thumbnailCloudinary || videoCloudinary))
    throw new ApiError(
      500,
      "Error while uploading thumbnail or video to cloudinary"
    );

  // Video object
  const createdVideo = await Video.create({
    videoFile: videoCloudinary.secure_url,
    thumbnail: thumbnailCloudinary.secure_url,
    title,
    description,
    duration: Math.round(videoCloudinary.duration, 0),
    owner: req.user._id,
  });

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while creating video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
