import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 1. If JWT token is provided, verify it
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "tansam_pms_jwt_secret_key_2026_secure"
      );
      req.user = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username,
        email: decoded.email,
        name: decoded.username,
      };
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
      }
      return res.status(401).json({ message: "Invalid token. Authentication failed." });
    }
  }

  // 2. Fallback to custom headers during transition
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];
  const userName = req.headers["x-user-name"];

  if (userId && userRole) {
    req.user = {
      id: userId,
      role: userRole,
      name: userName,
      username: userName,
    };
    return next();
  }

  return res.status(401).json({
    message: "Unauthorized. Authentication token required.",
  });
};

