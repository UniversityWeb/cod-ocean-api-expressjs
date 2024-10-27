const { auth } = require('~/common/configs/firebase');
const { ResponseBuilder } = require('~/login/utils/utils'); // Adjust the path as needed

const JwtTokenFilter = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json(ResponseBuilder.error({ message: 'No token provided' }));
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);
    req.currentUser = decodedToken; // This contains user ID and other claims from the token
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json(ResponseBuilder.error({ message: 'Unauthorized' }));
  }
};

module.exports = JwtTokenFilter;
