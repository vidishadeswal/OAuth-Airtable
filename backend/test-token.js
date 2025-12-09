import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
async function testToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");
    const tokens = await mongoose.connection.db
      .collection("oauthtokens")
      .find({})
      .toArray();
    if (tokens.length === 0) {
      console.log("No tokens found!");
      process.exit(1);
    }
    const token = tokens[0];
    console.log("Testing token:", token.accessToken.substring(0, 30) + "...\n");
    console.log("Test 1: Getting user info...");
    try {
      const userResponse = await axios.get(
        "https://api.airtable.com/v0/meta/whoami",
        {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        }
      );
      console.log("✓ User info:", {
        id: userResponse.data.id,
        email: userResponse.data.email,
        scopes: userResponse.data.scopes,
      });
    } catch (error) {
      console.log(
        "✗ User info failed:",
        error.response?.status,
        error.response?.data
      );
    }
    console.log("\nTest 2: Getting bases...");
    try {
      const basesResponse = await axios.get(
        "https://api.airtable.com/v0/meta/bases",
        {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        }
      );
      console.log("✓ Bases:", basesResponse.data.bases?.length || 0);
      if (basesResponse.data.bases && basesResponse.data.bases.length > 0) {
        basesResponse.data.bases.forEach((base) => {
          console.log("  -", base.name, `(${base.id})`);
        });
      } else {
        console.log(
          "⚠️  No bases found. The Airtable account may not have any bases."
        );
      }
    } catch (error) {
      console.log(
        "✗ Bases failed:",
        error.response?.status,
        error.response?.data
      );
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
testToken();