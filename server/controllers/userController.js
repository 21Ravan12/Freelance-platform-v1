const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { sendCodeEmail, hashPassword, comparePassword, generateRandomCode } = require('../utils/utils');
const { jwtConfig } = require('../config/config');
const { getDb } = require('../config/db');

const db = getDb();

const signinStorage = new Map();
const forgetStorage = new Map();

const registerUser = async (req, res) => {
  try {
    const { email, password, name, birthyear } = req.body;
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: `This email is already in use: ${email}` });
    }

    const hashedPassword = await hashPassword(password);
    const randomCode = generateRandomCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; 

    signinStorage.set(email, { email, password: hashedPassword, name, birthyear, code: randomCode, expiresAt });

    const token = jwt.sign(
      { email },
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn } 
    );

    await sendCodeEmail(email, randomCode);
    res.status(200).json({ message: "Verification code sent successfully!", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const completeRegistration = async (req, res) => {
  try {
    const { code } = req.body;
    const email = req.user.email; 

    const userEntry = signinStorage.get(email);
    if (!userEntry) {
      return res.status(400).json({ message: "User not found or code expired." });
    }

    if (String(userEntry.code) !== String(code)) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (Date.now() > userEntry.expiresAt) {
      signinStorage.delete(email);
      return res.status(400).json({ message: "The verification code has expired." });
    }

    const newUser = {
      name: userEntry.name,
      email: userEntry.email,
      password: userEntry.password,
      birthyear: userEntry.birthyear,
    };

    await db.collection('users').insertOne(newUser);
    signinStorage.delete(email);

    res.status(200).json({ message: "User successfully signed up!" });
  } catch (err) {
    res.status(500).json({ message: `Error occurred: ${err.message}` });
  }
};

const saveUserDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized: No user session found." });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Bad Request: No data provided." });
    }

    const {
      userType,
      bio,
      skills,
      portfolioURL,
      socialLinks,
      experienceLevel,
      companyName,
      companyWebsite,
      companyBio,
      jobCategories,
      hourlyRate,
      location,
    } = req.body;

    const email = req.user.email;

    if (!db || !db.collection) {
      return res.status(500).json({ message: "Database connection error." });
    }

    const existingUser = await db.collection("users").findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found or session expired." });
    }

    if (userType === "freelancer") {
      if (!bio || !skills || !hourlyRate || !location) {
        return res.status(400).json({ message: "Bad Request: Missing required fields for freelancer." });
      }

      if (typeof hourlyRate !== 'object' || !hourlyRate.amount || !hourlyRate.currency) {
        return res.status(400).json({ message: "Bad Request: Invalid hourlyRate format." });
      }

      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Bad Request: Skills must be an array." });
      }
    }

    else if (userType === "employer") {
      if (!companyName || !companyWebsite || !companyBio || !jobCategories) {
        return res.status(400).json({ message: "Bad Request: Missing required fields for employer." });
      }
    }

    else {
      return res.status(400).json({ message: "Bad Request: Invalid user type." });
    }

    const userDetails = {
      userType,
      ...(userType === "freelancer" ? {
        bio,
        skills: skills.map(skill => {
          if (skill && typeof skill === 'object' && 'value' in skill) {
            return skill.value;
          }
          return null; 
        }).filter(skill => skill !== null), 
        portfolioURL,
        socialLinks,
        experienceLevel,
        hourlyRate: {
          amount: parseFloat(hourlyRate.amount), 
          currency: hourlyRate.currency
        },
        location,
      } : {
        companyName,
        companyWebsite,
        companyBio,
        jobCategories
      })
    };

    const result = await db.collection("users").updateOne(
      { email: email },
      { $set: userDetails }
    );

    if (result.matchedCount === 0) {
      throw new Error("No user found with the provided email.");
    }

    res.status(200).json({ message: "Details successfully updated!" });

  } catch (err) {
    console.error("Error in saveUserDetails:", err);
    res.status(500).json({
      message: `Error occurred: ${err.message}`,
      stack: err.stack,
      error: err
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await db.collection('users').findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "No user found with this email." });
    }

    const userId = existingUser._id.toString(); 
    const randomCode = generateRandomCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; 

    forgetStorage.set(userId, { userId, code: randomCode, expiresAt });

    await sendCodeEmail(email, randomCode);

    const token = jwt.sign(
      { id: userId}, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn } 
    );

    res.status(200).json({ message: "Password recovery code sent successfully!" ,token: token });
    
  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};

const verifyRecoveryCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;  

    const userStorage = forgetStorage.get(userId);
    
    if (!userStorage || typeof userStorage.code === "undefined") {
      return res.status(400).json({ message: "Invalid recovery code entered." });
    }

    if (Number(userStorage.code) !== Number(code)) {
      return res.status(400).json({ message: "Invalid recovery code entered." });
    }

    if (Date.now() > userStorage.expiresAt) {
      return res.status(400).json({ message: "The recovery code has expired." });
    }

    return res.status(200).json({ message: "Code successfully verified!" });

  } catch (err) {
    console.error("Error in verifyRecoveryCode:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const refreshPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id; 

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Password updated successfully!" });
    } else {
      res.status(500).json({ message: "Failed to update password." });
    }
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error occurred." });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log("Login request received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await db.collection("users").findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log("Password match:", isMatch);

    if (isMatch) {
      const token = jwt.sign(
        { id: user._id }, 
        jwtConfig.secret,
        { expiresIn: "24h" } 
      );
      
      res.status(200).json({ 
        message: "Login successful!", 
        token
      });

    } else {
      res.status(400).json({ message: "Invalid password." });
    }
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: "Internal server error.", error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const currentYear = new Date().getFullYear();
    const age = user.birthyear ? currentYear - user.birthyear : null;

    const profileDetails = {
      userType: user.userType,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      skills: user.skills || [],
      portfolioURL: user.portfolioURL || '',
      socialLinks: user.socialLinks || [],
      experienceLevel: user.experienceLevel || '',
      hourlyRate: user.hourlyRate || { amount: 0, currency: 'USD' },
      location: user.location || '',
      companyName: user.companyName || '',
      companyWebsite: user.companyWebsite || '',
      companyBio: user.companyBio || '',
      jobCategories: user.jobCategories || [],
      age: age
    };

    res.status(200).json(profileDetails);

  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const {
      name,
      email,
      bio,
      skills,
      portfolioURL,
      socialLinks,
      experienceLevel,
      hourlyRate,
      location,
      companyName,
      companyWebsite,
      companyBio,
      jobCategories,
    } = req.body;

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userUpdateFields = {};

    if (name) userUpdateFields.name = name;
    if (email) userUpdateFields.email = email;
    if (bio) userUpdateFields.bio = bio;
    if (location) userUpdateFields.location = location;

    if (skills) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array." });
      }
      userUpdateFields.skills = skills;
    }
    if (portfolioURL) userUpdateFields.portfolioURL = portfolioURL;
    if (socialLinks) userUpdateFields.socialLinks = socialLinks;
    if (experienceLevel) userUpdateFields.experienceLevel = experienceLevel;

    if (hourlyRate) {
      if (typeof hourlyRate !== 'object' || !hourlyRate.amount || !hourlyRate.currency) {
        return res.status(400).json({ message: "Invalid hourlyRate format." });
      }
      userUpdateFields.hourlyRate = {
        amount: parseFloat(hourlyRate.amount),
        currency: hourlyRate.currency
      };
    }

    if (companyName) userUpdateFields.companyName = companyName;
    if (companyWebsite) userUpdateFields.companyWebsite = companyWebsite;
    if (companyBio) userUpdateFields.companyBio = companyBio;
    if (jobCategories) userUpdateFields.jobCategories = jobCategories;

    if (Object.keys(userUpdateFields).length > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: userUpdateFields }
      );
    }

    res.status(200).json({ message: "Profile updated successfully!" });

  } catch (err) {
    console.error("Error in updateProfile:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = { registerUser, completeRegistration, saveUserDetails,
                   requestPasswordReset, verifyRecoveryCode, loginUser,
                   getProfile, updateProfile, refreshPassword};