const { db } = require('~/common/configs/firebase');
const { TOKENS } = require('~/common/utils/constants');
const { convertFirebaseDocToToken } = require('~/auth/utils/utils');

const TokenService = {
  createOrUpdateToken: async (userId, token) => {
    const tokenRef = db.collection(TOKENS).doc(userId);
    const existingToken = await tokenRef.get();

    if (existingToken.exists) {
      await tokenRef.update({ token });
    } else {
      await tokenRef.set({
        token: token,
        userId: userId,
      });
    }
  },

  getTokenByUserId: async (userId) => {
    const tokenRef = db.collection(TOKENS).doc(userId);
    const doc = await tokenRef.get();

    if (!doc.exists) {
      throw new Error('Token not found');
    }

    return convertFirebaseDocToToken(doc);
  },

  deleteToken: async (userId) => {
    const tokenRef = db.collection(TOKENS).doc(userId);
    await tokenRef.delete();
  },

  listTokens: async () => {
    const snapshot = await db.collection(TOKENS).get();
    const tokens = snapshot.docs
      .map(doc => convertFirebaseDocToToken(doc));
    return tokens;
  }
};

module.exports = TokenService;
