# Video Streaming App

A full-featured backend for video streaming application that allows users to upload, and interact with videos in real-time.

## **Model Link**

[Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## **Features**

- **User Authentication**: Secure sign-up, login, and logout functionality.
- **Video Upload**: Upload video content to the platform.
- **Commenting System**: Engage with videos by adding comments.

## Tech Stack

- **Backend**:

  - [Node.js](https://nodejs.org/) - Server-side runtime.
  - [Express.js](https://expressjs.com/) - Web framework.
  - [Multer](https://github.com/expressjs/multer) - File upload middleware.

- **Cloud Storage**:

  - [Cloudinary](https://cloudinary.com/) - Image and video transformation.

- **Authentication**:

  - [JWT](https://jwt.io/) - Secure JSON Web Token-based authentication.

- **Database**:
  - [MongoDB](https://www.mongodb.com/) - NoSQL database.
  - [Mongoose](https://mongoosejs.com/) - MongoDB object modeling.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Praanshu98/video_streaming_app.git
   cd video_streaming_app
   ```

2. **Install dependencies**:

   For the backend:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the `video_streaming_app` directory and add the following:

   ```bash
    PORT=8000
    MONGODB_USERNAME=<your_mongodb_username>
    MONGODB_PASSWORD=<your_mongodb_password>
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=<your_access_token_secret>
    ACCESS_TOKEN_EXPIRY=<your_access_token_expiry>
    REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
    REFRESH_TOKEN_EXPIRY=<your_refresh_token_expiry>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   ```

4. **Start the development server**:

   Backend (Express API):

   ```bash
   npm run dev
   ```

## Usage

- Sign up or log in to the application.
- Upload a video file.
- Add comments to interact with the video content.
- Enjoy real-time updates and interactions!

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes.
4. Commit your changes: `git commit -m 'Add some feature'`.
5. Push to the branch: `git push origin feature-branch-name`.
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
