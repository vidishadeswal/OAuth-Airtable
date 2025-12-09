import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    airtableUserId: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    profileImage: String,
    oauthTokens: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OAuthToken",
    },
    loginTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", UserSchema);