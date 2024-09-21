import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // Get total video
  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  if (!video) {
    throw new ApiError(500, "Something went wrong while getting total views");
  }

  const totalChannelVideos = video.length;

  // Get total video views counts
  let totalVideoViewsCount = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalCount: {
          $sum: "$views",
        },
      },
    },
  ]);

  if (!totalVideoViewsCount) {
    throw new ApiError(
      500,
      "Something went wrong while getting total video counts"
    );
  }

  totalVideoViewsCount = totalVideoViewsCount[0].totalCount;

  // Get total subscribers
  const subscribers = await Subscription.find({
    channel: req.user._id,
  });

  if (!subscribers) {
    throw new ApiError(
      500,
      "Something went wrong while getting total subscribers"
    );
  }

  const totalSubscribers = subscribers.length;

  // Get total likes
  const likes = await Like.find({
    likedBy: req.user._id,
  });

  if (!likes) {
    throw new ApiError(500, "Something went wrong while getting total likes");
  }

  const totalLikes = likes.length;

  // Get total comments
  const comments = await Comment.find({
    owner: req.user._id,
  });

  if (!comments) {
    throw new ApiError(
      500,
      "Something went wrong while getting total comments"
    );
  }

  const totalComments = comments.length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalChannelVideos,
        totalSubscribers,
        totalLikes,
        totalComments,
        totalVideoViewsCount,
      },
      "Total channel views fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  if (!video) {
    throw new ApiError(500, "Something went wrong while getting total views");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
