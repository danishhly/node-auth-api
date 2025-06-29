
const { signupSchema, acceptCodeSchema, changePasswordSchema } = require('../middlewares/validator');
const { signinSchema } = require('../middlewares/validator');
const User = require('../models/usersModels'); // ✅ Import User model
const { doHash, doHashValidation } = require('../utils/hashing');
const transport = require('../middlewares/sendmail'); // ✅ Import transport for sending emails
const { hmacProcess } = require('../utils/hashing'); // ✅ Import hmacProcess for hashing verification codes
const { acceptFPCodeSchema } = require('../middlewares/validator'); // ✅ Import acceptFPCodeSchema for forgot password code validation
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const {error, value} = signupSchema.validate({ email, password });


    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
    })
    const result = await newUser.save();
    result.password = undefined; // Remove password from response
    res.status(201).json({ 
        message: "User created successfully",
        user: result,
        });

  } catch (error) {
    console.log("Error during signup:", error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const {error, value} = signinSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
     const existingUser = await User.findOne({ email }).select('+password'); // Include password in query
     if (!existingUser) {
      return res.status(400).json({ message: "user not exist" });
}
const result = await doHashValidation(password, existingUser.password);
if (!result) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const token = jwt.sign(
    { userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified, // Include verification status in token
    },
    process.env.TOKEN_SECRET,
    {
        expiresIn: '8h', // Token expiration time
    }
  );
  res.cookie('Authorization', 'Bearer' + token, {expires: new Date(Date.now() + 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production', })
  .json({
    success: true,
    token,
    message: "Signin successful",
  });
}
catch (error) {
    console.log("Error during signin:", error);
    return res.status(500).json({ message: "Internal server error" })
  }
};

exports.signout = async (req, res) => {
  
    res.clearCookie('Authorization');
    res.status(200).json({ message: "Signout successfully" });
    // Optionally, you can also send a response indicating successful signout
  };
  exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (existingUser.verified) {
            return res.status(400).json({ message: "User already verified" });
        }
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        let info = await transport.sendMail({
            from: process.env.EMAIL_USER, // Sender address         
            to: existingUser.email, // List of recipients
            subject: "Verification Code", // Subject line
            html: '<h1>' + codeValue + '</h1>', // HTML body content
        })

        if(info.accepted[0] === existingUser.email) {
            const hashedCode = hmacProcess(codeValue, process.env.HASH_KEY);
            existingUser.verificationCode = hashedCode; // Store the hashed code
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ message: "Verification code sent successfully" });

        }
        return res.status(500).json({ message: "Failed to send verification code" });

    } catch (error) {
        console.log("Error during sending verification code:", error);
    }
};

exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try {
      const {error, value} = acceptCodeSchema.validate({ email, providedCode });
      if(error) {
        return res
        .status(400).json({ message: error.details[0].message });
      }

      const codeValue = providedCode.toString();
      const existingUser = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation'); // Include verificationCode and verificationCodeValidation in query
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (existingUser.verified) {
        return res.status(400).json({ message: "User already verified" });
      }

      if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
        return res.status(400).json({ message: "Verification code not sent or expired" });
      }

      if(Date.now() - existingUser.verificationCodeValidation > 10 * 60 * 1000) { // Check if the code is older than 10 minutes
        return res.status(400).json({ message: "Verification code expired" });
      }
      const hashedCode = hmacProcess(codeValue, process.env.HASH_KEY)

      if(hashedCode === existingUser.verificationCode) {
        existingUser.verified = true;
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeValidation = undefined;
        await existingUser.save()
        return res.status(200).json({ message: "User verified successfully" });
      }
      return res.status(400).json({ message: "Invalid verification code" });

    } catch (error) {
      console.log((error))
    }
  };

  exports.changePassword = async (req, res) => {
    const { userId, verified} = req.user; // Extract userId and verified status from request
    const { oldPassword, newPassword } = req.body;
    try {
       const {error, value} = changePasswordSchema.validate({ oldPassword, newPassword });
      if(error) {
        return res
        .status(400).json({ message: error.details[0].message });
      }
      if (!verified) {
        return res.status(403).json({ message: "User not verified" });
      }
      const existingUser = await User.findOne({_id:userId}).select('+password');
      if(!existingUser) {
        return res.status(404).json({ message: "User not found" });
      } // Include password in query
      const result = await doHashValidation(oldPassword, existingUser.password);
      if (!result) {
        return res.status(400).json({ message: "Invalid old password" });
      }
      const hashedNewPassword = await doHash(newPassword, 12);
      existingUser.password = hashedNewPassword; // Update password 
      await existingUser.save();
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.log(error);
    }

  };

  exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        let info = await transport.sendMail({
            from: process.env.EMAIL_USER, // Sender address         
            to: existingUser.email, // List of recipients
            subject: "Forgot Password code", // Subject line
            html: '<h1>' + codeValue + '</h1>', // HTML body content
        })

        if(info.accepted[0] === existingUser.email) {
            const hashedCode = hmacProcess(codeValue, process.env.HASH_KEY);
            existingUser.forgotPasswordCode = hashedCode; // Store the hashed code
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ message: "Verification code sent successfully" });

        }
        return res.status(500).json({ message: "Failed to send verification code" });

    } catch (error) {
        console.log("Error during sending verification code:", error);
    }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error } = acceptFPCodeSchema.validate({ email, providedCode });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
      return res.status(400).json({ message: "Verification code not sent or expired" });
    }

    if (Date.now() - existingUser.forgotPasswordCodeValidation > 10 * 60 * 1000) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    const hashedCode = hmacProcess(codeValue, process.env.HASH_KEY);

    if (hashedCode === existingUser.forgotPasswordCode) {
      // ✅ Reset the password
      const hashedPassword = await doHash(newPassword);
      existingUser.password = hashedPassword;

      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();

      return res.status(200).json({ message: "Password reset successfully" });
    }

    return res.status(400).json({ message: "Invalid verification code" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



