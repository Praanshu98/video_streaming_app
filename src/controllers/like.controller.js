import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Get video details
  const video = await Video.findById(videoId);

  // Check if video exists
  if (!video) {
    throw new ApiError(404, "Video does not exist");
  }

  // Check if video is already liked by the user
  const isVideoAlreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // Delete like if already liked
  if (isVideoAlreadyLiked) {
    const deletedLike = await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user._id,
    });

    if (!deletedLike) {
      throw new ApiError(500, "Something went wrong while deleting like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }

  // Create like for video
  const createdLike = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  if (!createdLike) {
    throw new ApiError(500, "Something went wrong while creating like");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdLike, "Like created successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Check if commentId is valid
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  // Get comment details
  const comment = await Comment.findById(commentId);

  // Check if comment exists
  if (!comment) {
    throw new ApiError(404, "Comment does not exist");
  }

  // Check if comment is already liked by the user
  const isCommentAlreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  // Delete like if already liked
  if (isCommentAlreadyLiked) {
    const deletedLike = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user._id,
    });

    if (!deletedLike) {
      throw new ApiError(500, "Something went wrong while deleting like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }

  // Create like for comment
  const createdLike = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!createdLike) {
    throw new ApiError(500, "Something went wrong while creating like");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdLike, "Like created successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  // Get tweet details
  const tweet = await Tweet.findById(tweetId);

  // Check if tweet exists
  if (!tweet) {
    throw new ApiError(404, "Tweet does not exist");
  }

  // Check if tweet is already liked by the user
  const isTweetAlreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  // Delete like if already liked
  if (isTweetAlreadyLiked) {
    const deletedLike = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    if (!deletedLike) {
      throw new ApiError(500, "Something went wrong while deleting like");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedLike, "Like deleted successfully"));
  }

  // Create like for tweet
  const createdLike = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (!createdLike) {
    throw new ApiError(500, "Something went wrong while creating like");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdLike, "Like created successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // Get all liked videos
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  });

  if (!likedVideos) {
    throw new ApiError(500, "Something went wrong while getting liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
