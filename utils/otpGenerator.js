// utils/otpGenerator.js
export function generateOTP() {
  // Generates a random 6-digit number as a string, padded with zeros if needed
  return Math.floor(100000 + Math.random() * 900000).toString();
}
