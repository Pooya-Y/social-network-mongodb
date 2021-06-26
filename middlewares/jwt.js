const jwt = require('jsonwebtoken');


function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      process.env.AUTH_ID =req.user.userId;
      next();
    }
    catch (ex) {
      res.status(400).send('Invalid token.');
    }
}

function isAdmin(req, res, next) { 
  if (!req.user.isAdmin) return res.status(403).send('Access denied.');
  next();
}
module.exports.auth = auth;
module.exports.isAdmin = isAdmin;

