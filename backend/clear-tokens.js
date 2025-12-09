import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function clearTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB");
    const result = await mongoose.connection.db
      .collection("oauthtokens")
      .deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} OAuth tokens`);
    await mongoose.connection.close();
    console.log(
      "\n✓ Done! Please re-authenticate through the app at http://localhost:3000"
    );
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
clearTokens();