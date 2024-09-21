import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if name and description are empty
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  // check if playlist with same name already exists
  const playlistWithSameName = await Playlist.findOne({
    name,
    owner: req.user._id,
  });
  if (playlistWithSameName) {
    throw new ApiError(400, "Playlist with same name already exists");
  }

  // Create playlist
  const createdPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });

  if (!createdPlaylist) {
    throw new ApiError(500, "Something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // check if userId is valid
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Get user playlists
  const playlists = await Playlist.find({ owner: userId });

  if (!playlists) {
    throw new ApiError(500, "Something went wrong while getting playlists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Check if playlistId is valid
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // Get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Check if playlistId is valid
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while getting playlist");
  }

  // Check if video is already in playlist
  const isVideoInPlaylist = playlist.videos.find((video) =>
    video.equals(new mongoose.Types.ObjectId(videoId))
  );

  if (isVideoInPlaylist) {
    throw new ApiError(400, "Video is already in playlist");
  }

  // Add video to playlist
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Check if playlistId is valid
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // Check if videoId is valid
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Check if video is in playlist
  const isVideoInPlaylist = await Playlist.find({
    videos: { $in: [videoId] },
  });

  if (isVideoInPlaylist.length === 0) {
    throw new ApiError(400, "Video is not in playlist");
  }

  // Delete video from playlist
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Check if playlistId is valid
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // Delete playlist
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(500, "Something went wrong while deleting playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // Check if playlistId is valid
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // Check if name and description are empty
  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  // Get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist does not exist");
  }

  // Update playlist
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
