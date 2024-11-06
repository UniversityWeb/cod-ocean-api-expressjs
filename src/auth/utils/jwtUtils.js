const jwt = require('jsonwebtoken');

// Load JWT secret from environment variables or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Generate JWT token for a user
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber, // Additional claim
    isActive: user.isActive // Additional claim
  };

  const options = { expiresIn: '1h' }; // Token expiration time (1 hour in this case)

  return jwt.sign(payload, JWT_SECRET, options); // Create and return the JWT
};

// Generate refresh token (token with a longer expiration time)
const generateRefreshToken = (email) => {
  const options = { expiresIn: '7d' }; // Refresh token expiration time (7 days in this case)

  return jwt.sign({ email }, JWT_SECRET, options); // Generate the refresh token
};

// Validate the token by checking expiration and comparing the email and active status
const validateToken = (token, userDetails) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token with the secret

    // Validate email and isActive claim from the token
    if (decoded.email === userDetails.email && decoded.isActive === userDetails.isActive) {
      return true; // Token is valid
    }
    return false; // Invalid token or mismatched email/status
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const verifyToken = (token) => {
  try {
    if (token.startsWith('Bearer ')) {
      token = token.substring(7); // Remove "Bearer " prefix
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

const extractAllClaims = (token) => {
  try {
    return jwt.decode(token); // Decode token without verifying
  } catch (error) {
    throw new Error('Error extracting claims from token');
  }
};

// Extract specific claim (e.g., email, isActive) from the token
const extractClaim = (token, claim) => {
  const decoded = extractAllClaims(token);
  return decoded ? decoded[claim] : null;
};

// Extract email from the token
const extractEmail = (token) => {
  return extractClaim(token, 'email');
};

// Extract 'isActive' claim from the token
const extractIsActive = (token) => {
  return extractClaim(token, 'isActive');
};

// Extract email from a Bearer token (e.g., "Bearer <token>")
const extractEmailFromBearerToken = (token) => {
  if (token.startsWith('Bearer ')) {
    return extractEmail(token.substring(7)); // Remove "Bearer " prefix
  }
  throw new Error('Invalid Bearer token format');
};

// Verify if a token is valid
const isValidToken = (token) => {
  try {
    extractAllClaims(token); // If no error occurs, token is valid
    return true;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  validateToken,
  extractAllClaims,
  extractClaim,
  extractEmail,
  extractIsActive,
  extractEmailFromBearerToken,
  isValidToken,
  verifyToken,
};
