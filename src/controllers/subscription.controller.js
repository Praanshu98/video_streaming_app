import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is invalid");
  }

  // Check if userId and channelId are same
  if (String(req.user._id) === String(channelId)) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // Check if user is already subscribed to the channel
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (isSubscribed) {
    const deletedSubscription = await Subscription.findOneAndDelete({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (!deletedSubscription) {
      throw new ApiError(
        500,
        "Something went wrong while deleting subscription"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deletedSubscription,
          "Subscription deleted successfully"
        )
      );
  }

  // Create subscription
  const createdSubscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!createdSubscription) {
    throw new ApiError(500, "Something went wrong while creating subscription");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdSubscription,
        "Subscription created successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  console.log(channelId);

  // Check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is invalid");
  }

  // Get subscribers of the channel
  const subscribers = await Subscription.find({
    channel: channelId,
  });

  if (!subscribers) {
    throw new ApiError(500, "Something went wrong while getting subscribers");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Check if subscriberId is valid
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber Id is invalid");
  }

  // Get subscribed channels of the subscriber
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  });

  if (!subscribedChannels) {
    throw new ApiError(
      500,
      "Something went wrong while getting subscribed channels"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
