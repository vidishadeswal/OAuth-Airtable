import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import OAuthToken from "../models/OAuthToken.js";
const AIRTABLE_OAUTH_TOKEN_URL = "https://airtable.com/oauth2/v1/token";
const AIRTABLE_OAUTH_USER_INFO_URL = "https://api.airtable.com/v0/meta/whoami";
const stateStore = new Map();
export const getOAuthUrl = (req, res) => {
  const clientId = process.env.AIRTABLE_CLIENT_ID;
  const redirectUri = process.env.AIRTABLE_OAUTH_REDIRECT_URI;
  const scope =
    "schema.bases:read data.records:read data.records:write webhook:manage user.email:read";
  const state = crypto.randomBytes(32).toString("base64url");
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  stateStore.set(state, {
    codeVerifier,
    timestamp: Date.now(),
  });
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of stateStore.entries()) {
    if (value.timestamp < tenMinutesAgo) {
      stateStore.delete(key);
    }
  }
  const oauthUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    scope
  )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  res.json({ oauthUrl });
};
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    if (error) {
      console.error("OAuth error from Airtable:", error, error_description);
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(
        `${frontendUrl}/auth/error?error=${encodeURIComponent(
          error
        )}&description=${encodeURIComponent(error_description || "")}`
      );
    }
    if (!code) {
      console.error("No authorization code received");
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(
        `${frontendUrl}/auth/error?error=no_code&description=Authorization code not provided`
      );
    }
    if (!state || !stateStore.has(state)) {
      console.error("Invalid or expired state parameter");
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(
        `${frontendUrl}/auth/error?error=invalid_state&description=Invalid state parameter`
      );
    }
    const stateData = stateStore.get(state);
    const codeVerifier = stateData?.codeVerifier;
    if (!codeVerifier) {
      console.error("Code verifier not found for state");
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(
        `${frontendUrl}/auth/error?error=missing_verifier&description=Code verifier not found`
      );
    }
    stateStore.delete(state);
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.AIRTABLE_OAUTH_REDIRECT_URI);
    params.append("code_verifier", codeVerifier); 
    if (!process.env.AIRTABLE_CLIENT_SECRET) {
      params.append("client_id", process.env.AIRTABLE_CLIENT_ID);
    }
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (process.env.AIRTABLE_CLIENT_SECRET) {
      const credentials = Buffer.from(
        `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
      ).toString("base64");
      headers.Authorization = `Basic ${credentials}`;
    }
    const tokenResponse = await axios.post(AIRTABLE_OAUTH_TOKEN_URL, params, {
      headers,
    });
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const userInfoResponse = await axios.get(AIRTABLE_OAUTH_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const airtableUser = userInfoResponse.data;
    const { id: airtableUserId, email, name } = airtableUser;
    const userEmail = email || `airtable_${airtableUserId}@airtable.local`;
    const userName = name || "Airtable User";
    let user = await User.findOne({ airtableUserId });
    if (!user) {
      user = new User({
        email: userEmail,
        airtableUserId,
        name: userName,
      });
      await user.save();
    } else {
      user.email = userEmail;
      user.name = userName;
      user.loginTimestamp = new Date();
      await user.save();
    }
    let oauthToken = await OAuthToken.findOne({ userId: user._id });
    if (!oauthToken) {
      oauthToken = new OAuthToken({
        userId: user._id,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
      });
    } else {
      oauthToken.accessToken = access_token;
      oauthToken.refreshToken = refresh_token;
      oauthToken.expiresAt = new Date(Date.now() + expires_in * 1000);
    }
    await oauthToken.save();
    user.oauthTokens = oauthToken._id;
    await user.save();
    const appToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/success?token=${appToken}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const errorMessage =
      error.response?.data?.error_description ||
      error.message ||
      "Unknown error";
    res.redirect(
      `${frontendUrl}/auth/error?error=callback_error&description=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
};
export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-oauthTokens");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const refreshAccessToken = async (userId) => {
  try {
    const oauthToken = await OAuthToken.findOne({ userId });
    if (!oauthToken || !oauthToken.refreshToken) {
      throw new Error("No refresh token available");
    }
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", oauthToken.refreshToken);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (process.env.AIRTABLE_CLIENT_SECRET) {
      const credentials = Buffer.from(
        `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
      ).toString("base64");
      headers.Authorization = `Basic ${credentials}`;
    } else {
      params.append("client_id", process.env.AIRTABLE_CLIENT_ID);
    }
    const tokenResponse = await axios.post(AIRTABLE_OAUTH_TOKEN_URL, params, {
      headers,
    });
    const { access_token, expires_in } = tokenResponse.data;
    oauthToken.accessToken = access_token;
    oauthToken.expiresAt = new Date(Date.now() + expires_in * 1000);
    await oauthToken.save();
    return access_token;
  } catch (error) {
    console.error("Token refresh error:", error.message);
    throw error;
  }
};
export const getValidAccessToken = async (userId) => {
  try {
    const oauthToken = await OAuthToken.findOne({ userId });
    if (!oauthToken) {
      throw new Error("No OAuth token found");
    }
    if (
      oauthToken.expiresAt &&
      new Date() > new Date(oauthToken.expiresAt.getTime() - 5 * 60000)
    ) {
      return await refreshAccessToken(userId);
    }
    return oauthToken.accessToken;
  } catch (error) {
    console.error("Error getting valid access token:", error.message);
    throw error;
  }
};