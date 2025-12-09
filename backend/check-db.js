import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");
    const users = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();
    console.log("Users:", users.length);
    const tokens = await mongoose.connection.db
      .collection("oauthtokens")
      .find({})
      .toArray();
    console.log("OAuth Tokens:", tokens.length);
    if (tokens.length > 0) {
      console.log("\nToken details:");
      tokens.forEach((t) => {
        console.log("- User ID:", t.userId);
        console.log("- Expires:", t.expiresAt);
        console.log("- Has access token:", !!t.accessToken);
        console.log("- Is expired:", new Date() > new Date(t.expiresAt));
        if (t.accessToken) {
          console.log(
            "- Token preview:",
            t.accessToken.substring(0, 30) + "..."
          );
        }
      });
    } else {
      console.log("\n⚠️  No OAuth tokens found in database!");
      console.log("You need to complete the OAuth flow:");
      console.log("1. Go to http://localhost:3000");
      console.log("2. Click 'Login with Airtable'");
      console.log("3. Authorize the app");
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
checkDatabase();