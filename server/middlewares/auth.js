import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authorized, user not found',
          statusCode: 401
        });
      }

      next();
    }catch(error){

      console.error("Auth Middleware Error:", error.message);

      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: 'Token expired',
          statusCode: 401
        });
      }

      return res.status(401).json({
        success: false ,
        error: 'Not authorized, token failed',
        statusCode: 401
      })
    }
  }
  if (!token) {
        return res.sttaus(401).json({
          success: false,
          error: 'Not authorized, no token',
          statusCode: 401
        }); 
      }
}

export default protect;