const mongoose = require("mongoose");
require("dotenv").config();

async function fixIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collection = db.collection("reviews");

    console.log("Dropping all existing indexes on reviews collection...");
    try {
      await collection.dropIndexes();
      console.log("Successfully dropped all indexes");
    } catch (error) {
      console.log("Error dropping indexes (may not exist):", error.message);
    }

    console.log("Clearing any problematic review documents...");
    // Optional: Remove any documents that might cause issues
    // const result = await collection.deleteMany({});
    // console.log(`Removed ${result.deletedCount} existing reviews`);

    console.log("Index cleanup completed successfully!");
    console.log(
      "The new indexes will be created automatically when the server starts."
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  }
}

fixIndexes();
