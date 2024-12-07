function generateOTP() {
     return Math.floor(Math.random()*900000 + 100000)
}

// Example usage
// console.log("Your OTP is:", generateOTP());

export default generateOTP;