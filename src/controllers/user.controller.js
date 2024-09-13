import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import unlinkFile from "../utils/unlinkFile.js";

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
  // console.log({ userName, email, fullName, password });

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  console.log(req.files);

  const deleteUploadedFiles = (files) => {
    console.log(typeof files);
    Object.values(files).forEach((file) => {
      // console.log(file[0].path);
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

  // console.log("req.files: ", req.files);
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

export { registerUser };
