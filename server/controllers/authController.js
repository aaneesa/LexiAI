import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const {username, email, password} = req.body;
    const userExists = await User.findOne({$or : [{ email }]});
    if (userExists) {
      return res.status(400).json({
        success: false,
        error :
        userExists.email === email ? 'Email already in use' : 'Username already in use',
        statusCode: 400
      });
    }
    const user = await User.create({username, email, password});
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        user:{ 
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        },
        token
      },
      message: 'User registered successfully'
    })
      }catch(error) {
        next(error);
      }     
    }

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password){
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
        statusCode: 400
      });
    } 

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return  res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        statusCode: 401
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        token
      },
      message: 'User logged in successfully'
    });
    
      }
    catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: 'User profile fetched successfully'
    })

  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: { 
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email},
      message: "Profile updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
        statusCode: 401
      });
      
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
