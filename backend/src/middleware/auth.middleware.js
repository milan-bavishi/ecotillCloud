const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Authentication middleware to verify JWT token
 * or get user from request
 */
module.exports = async (req, res, next) => {
  try {
    console.log("Auth middleware called for:", req.path);

    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("Auth header present:", !!authHeader);

    let userData = null;

    // Check if request has user data in body (for direct user info passing)
    if (req.body && req.body._userData) {
      userData = req.body._userData;
      console.log("User data found in request body:", userData.email);
      // Remove the user data from the body to not save it in the database
      delete req.body._userData;
    }

    // Extract token from header if available
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("Extracted token from header");
    }

    // If we have user data directly passed
    if (userData) {
      console.log("Using userData from request body");
      req.user = {
        id: userData.id || userData._id,
        email: userData.email,
        role: userData.role || "user",
      };
      return next();
    }

    // If no auth header but we have query user param, create basic user context
    if (
      req.query &&
      req.query.user &&
      (!token || token === "undefined" || token === "null")
    ) {
      console.log("Creating user context from query param:", req.query.user);
      req.user = {
        email: req.query.user,
        role: "user",
      };
      return next();
    }

    // If no valid authorization, respond with error
    if (!token || token === "undefined" || token === "null") {
      console.log("No valid token found");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    try {
      console.log("Verifying token");

      // Verify token with our JWT secret
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret_key_for_dev"
      );

      console.log("Token verified, decoded:", {
        id: decoded.id,
        email: decoded.email,
      });

      // Find user by id or use the token payload
      let user;

      if (decoded.id) {
        user = await User.findById(decoded.id).select("-password");
      }

      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email }).select("-password");
      }

      if (!user) {
        // If no user found but we have decoded info, create a temp user context
        console.log("No user found in DB, using decoded info from token");
        req.user = {
          id: decoded.id || null,
          email: decoded.email,
          role: decoded.role || "user",
        };
      } else {
        // Use the found user
        console.log("User found in DB:", user.email);
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role || "user",
        };
      }
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError.message);

      // Check if we have a user email in query params as fallback
      if (req.query && req.query.user) {
        console.log("Falling back to query param user:", req.query.user);
        req.user = {
          email: req.query.user,
          role: "user",
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};
