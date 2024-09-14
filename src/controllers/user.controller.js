import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import unlinkFile from "../utils/unlinkFile.js";
import jwt from "jsonwebtoken";

/**
 * Function to generate access and refresh token for a user and update refresh token in database and return access token and refresh token
 * @param {userId} userId User's Id for which access and refresh token has to be generated
 *
 * @returns accessToken, refreshToken
 */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get user data from request body
  // Check if user already exists ( with username and email )
  // Check is all the required information was sent
  // Temp store user avatar and cover image to server
  // Upload image(s) to cloudinary
  // Create user object and send mongodb request to insert a user
  // Send success status if user created, or send error status with error
  // Remove password and refresh token field from response
  // Return response

  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  const deleteUploadedFiles = (files) => {
    Object.values(files).forEach((file) => {
      unlinkFile(file[0].path);
    });
  };

  if (existedUser) {
    deleteUploadedFiles(req.files);
    throw new ApiError(
      409,
      "User with either username or email already exists."
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

  const avatarCloudinaryPath = await uploadToCloudinary(avatarLocalPath);

  const coverImageCloudinaryPath =
    await uploadToCloudinary(coverImageLocalPath);

  if (!avatarCloudinaryPath)
    throw new ApiError(400, "Error in Avatar image cloudinary path");

  const user = await User.create({
    fullName,
    avatar: avatarCloudinaryPath.url,
    coverImage: coverImageCloudinaryPath?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  // Get user login credentials from request body, email | username and password
  // Validate login credentials
  // Find the user in db
  // Match the password
  // Generate refresh token, access token.
  // Send cookies
  // Response success message

  const { userName, email, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  // Check for user or email in db
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) throw new ApiError(404, "User does not exist.");

  // Validate password for user
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials.");

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // remove password and refresh token from loggedInUser
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Security to not edit cookies from frontend
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully."
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  // Remove cookies
  // Remove refresh token from db
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!currentRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(
      currentRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh Token");

    if (currentRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is either expired or used.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
