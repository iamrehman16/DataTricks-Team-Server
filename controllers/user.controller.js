
import * as userService from '../services/user.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {generateOTP} from '../utils/otpGenerator.js'
import sendEmail from '../utils/sendEmail.js'; 

//get by id
export const getById = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//create
export const createUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'User data is required' });
    }

    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//update
export const updateUser = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Update data is required' });
    }

    const updatedUser = await userService.updateUser(req.body, id);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await userService.deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//register
export const register = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    try {
      const exist = await userService.getUserByEmail(email);
      if(exist)
        return res.status(409).json({ message: 'Email already in use' });
    } catch(err) {
      res.status(500).json({message:'Failed to register user'});
      console.log('Failed to register user',err);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //generate otp
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await userService.createUser({
      email,
      password: hashedPassword,
      otp,
      otpExpiresAt,
      ...rest,
    });

    sendEmail(email, otp).catch(console.error);

    res.status(201).json({
      message: 'Registration successful, please verify your email',
      userId: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.placeToken(user._id, refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Exclude password from user object
    const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//refresh token
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token, login again' });
      }

      const userExist = await userService.getUserById(decoded.id); 
      if (!userExist) {
        return res.status(403).json({ message: 'User not found' });
      }
      if (userExist.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Refresh token does not match, login again' });
      }

      const newAccessToken = generateAccessToken({
        id: userExist._id,
        email: userExist.email
      });

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// logout
export const logout = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // Ensure user exists
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invalidate refresh token
    await userService.updateUser({ refreshToken: null }, userId);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to log out' });
  }
};



// controllers/user.controller.js
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired, please request a new one" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const generateRefreshToken = (user)=>{
  return jwt.sign({id:user._id,email:user.email},process.env.JWT_REFRESH_TOKEN_SECRET,{expiresIn:'1h'});
}
const generateAccessToken = (user)=>{
  return jwt.sign({id:user._id,email:user.email},process.env.JWT_ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
}

