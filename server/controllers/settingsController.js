const { ObjectId } = require('mongodb');
const { hashPassword, comparePassword } = require('../utils/utils');
const mongoose = require('mongoose');
const { getDb } = require('../config/db');

const db = getDb();

  const getAccountSettings = async (req, res) => {
    try {
      const userId = req.user.id;
      
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format." });
      }
  
      let user = await db.collection('users_settings').findOne({ _id: new ObjectId(userId) });
  
      if (!user) {
        const defaultSettings = {
          _id: new ObjectId(userId), 
          notificationsEnabled: false,
          twoFactorEnabled: false,
          theme: "light",
          language: "en",
        };
  
        await db.collection("users_settings").insertOne(defaultSettings);
  
        user = defaultSettings;
      }
  
      res.status(200).json({
        notificationsEnabled: user.notificationsEnabled,
        twoFactorEnabled: user.twoFactorEnabled,
        theme: user.theme,
        language: user.language,
      });
  
    } catch (err) {
      console.error("Error in getAccountSettings:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const updateAccountSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationsEnabled, twoFactorEnabled, theme, language } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const result = await db.collection('users_settings').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          notificationsEnabled,
          twoFactorEnabled,
          theme,
          language,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account settings updated successfully." });

  } catch (err) {
    console.error("Error in updateAccountSettings:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to update password." });
    }

    res.status(200).json({ message: "Password changed successfully." });

  } catch (err) {
    console.error("Error in changePassword:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const userResult = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    await db.collection('users_settings').deleteOne({ _id: new ObjectId(userId) });

    if (userResult.deletedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account and associated data deleted successfully." });

  } catch (err) {
    console.error("Error in deleteAccount:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = {
  getAccountSettings,
  updateAccountSettings,
  changePassword,
  deleteAccount,
};