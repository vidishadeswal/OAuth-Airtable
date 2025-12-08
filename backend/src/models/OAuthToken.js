import mongoose from "mongoose";

const OAuthTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: Date,
    tokenType: {
      type: String,
      default: "Bearer",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OAuthToken", OAuthTokenSchema);
