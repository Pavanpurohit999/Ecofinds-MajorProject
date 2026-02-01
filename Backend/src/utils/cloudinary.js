const v2 = require("cloudinary").v2;
const fs = require("fs");

const cloudnairyconnect = () => {
  try {
    console.log("Cloudinary config check:");
    console.log(
      "CLOUD_NAME:",
      process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET"
    );
    console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET");
    console.log(
      "API_SECRET:",
      process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
    );

    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("CD connected");
  } catch (error) {
    console.log("error connecting CD" + error);
  }
};

const uploadOnCloudinary = async (fileData, fileName = null) => {
  try {
    console.log("Uploading file to Cloudinary:", fileData);
    console.log("Type of fileData:", typeof fileData);
    console.log("Is Buffer:", Buffer.isBuffer(fileData));

    await cloudnairyconnect();

    if (!fileData) {
      throw new Error("File data is required");
    }

    let uploadResponse;
    // Remove spaces and special chars for Cloudinary public_id
    const safePublicId = fileName
      ? fileName
          .split(".")[0]
          .replace(/\s+/g, "_")
          .replace(/[^\w-]/g, "")
      : undefined;

    // Check if fileData is a Buffer (from express-fileupload with useTempFiles: false)
    if (Buffer.isBuffer(fileData)) {
      console.log("Buffer length:", fileData.length);

      if (fileData.length === 0) {
        throw new Error("Empty buffer provided for image upload");
      }

      console.log("Uploading Buffer data to Cloudinary");
      // Create a data URL for the buffer
      const dataUrl = `data:image/png;base64,${fileData.toString("base64")}`;
      console.log("Data URL length:", dataUrl.length);

      // Upload buffer directly to Cloudinary using the data URL
      uploadResponse = await v2.uploader.upload(dataUrl, {
        resource_type: "auto",
        timeout: 30000,
        folder: "folder/temp",
      });
    } else if (typeof fileData === "string") {
      // Handle file path upload (when useTempFiles: true or direct file path)
      console.log("Uploading file from path:", fileData);

      if (!fs.existsSync(fileData)) {
        throw new Error(`File does not exist: ${fileData}`);
      }

      uploadResponse = await v2.uploader.upload(fileData, {
        resource_type: "auto",
        timeout: 30000,
        folder: "public/temp",
      });

      // Clean up the temp file
      try {
        fs.unlinkSync(fileData);
        console.log("Temp file cleaned up:", fileData);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    } else {
      throw new Error(
        "Invalid file data type. Expected Buffer or file path string."
      );
    }

    console.log("file is uploaded on cloudinary", uploadResponse.url);
    return uploadResponse;
  } catch (error) {
    console.error("Error uploading file on cloudinary:", error);

    // Only try to clean up if fileData is actually a file path (string) and not a Buffer
    if (typeof fileData === "string" && !Buffer.isBuffer(fileData)) {
      try {
        if (fs.existsSync(fileData)) {
          fs.unlinkSync(fileData);
          console.log("Temp file cleaned up after error:", fileData);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    return null;
  }
};

module.exports = uploadOnCloudinary;
