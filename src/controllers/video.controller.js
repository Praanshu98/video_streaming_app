import mongoose, { isValidObjectId, Schema } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType = "desc",
    userId = req.user._id,
  } = req.query;

  // Check if userId is valid
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Get all videos of logged in user
  const videos = await Video.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerData",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ownerData: {
          $arrayElemAt: ["$ownerData", 0],
        },
      },
    },
    {
      $match: {
        "ownerData._id": new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
  ]);

  if (!videos) {
    throw new ApiError(500, "Something went wrong while getting videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
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

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Video id is invalid");

  // Check if video exists
  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video does not exist");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Check if title, description, and videoId are empty
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnailLocalPath = req.file?.path;

  // Check if thumbnail is empty
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  // Check if video exists
  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video does not exist");

  // Upload to cloudinary
  const thumbnailCloudinary = await uploadToCloudinary(thumbnailLocalPath);

  if (!thumbnailCloudinary.secure_url) {
    throw new ApiError(400, "Error while uploading thumbnail to cloudinary");
  }

  // Update video
  const updatedVideo = await Video.findOneAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        title,
        description,
        thumbnail: thumbnailCloudinary.secure_url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Video id is invalid");

  // Check if video exists
  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video does not exist");

  // Delete video
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(500, "Something went wrong while deleting video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Video id is invalid");

  // Check if video exists
  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "Video does not exist");

  // Toggle publish status
  const toggledPublishStatus = await Video.findOneAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  if (!toggledPublishStatus) {
    throw new ApiError(
      500,
      "Something went wrong while toggling publish status"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, toggledPublishStatus, "Video toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
