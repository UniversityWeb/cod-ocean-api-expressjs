const { auth } = require('~/common/configs/firebase');
const { ResponseBuilder } = require('~/auth/utils/utils');

const JwtTokenFilter = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ResponseBuilder.error({ message: 'No token provided' }));
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json(ResponseBuilder.error({ message: 'Invalid token' }));
  }
};

module.exports = JwtTokenFilter;