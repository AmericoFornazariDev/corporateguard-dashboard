const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const tokenPrefix = 'Bearer fake-jwt-token-';
  if (authHeader.startsWith(tokenPrefix)) {
    return authHeader.replace(tokenPrefix, '');
  }
  return null;
};

module.exports = {
  getUserIdFromRequest,
};
