// models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    refreshToken: {
      type: String,
      default: null
    },
    isVerified:{
      type:Boolean,
      default:false
    },
    otp:{
      type:String,
      default:null
    },
    otpExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true 
  }
);


const User = mongoose.model('User', userSchema);

export default User;