const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
  let token;

  if (req.headers.client === 'not-browser') {
    token = req.headers.authorization;
  } else {
    token = req.cookies['Authorization'];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Remove "Bearer " if present
  const tokenValue = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    const decoded = jwt.verify(tokenValue, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in token verification:", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Access token expired" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Authentication failed" });
    }
  }
};
