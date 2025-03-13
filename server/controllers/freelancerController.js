const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { getDb } = require('../config/db');

const db = getDb();

  const getFreelancer = async (req, res) => {
    try {
      const freelancers = await db.collection('users')
        .find({ userType: 'freelancer' })
        .toArray();
  
      if (freelancers.length === 0) {
        return res.status(404).json({ message: "No freelancers found." });
      }
  
      const formattedFreelancers = freelancers.map((freelancer) => ({
        _id: freelancer._id.toString(),
        userType: freelancer.userType,
        name: freelancer.name,
        email: freelancer.email,
        skills: freelancer.skills || [],
        portfolioURL: freelancer.portfolioURL || '',
        hourlyRate: freelancer.hourlyRate || 0,
        location: freelancer.location || '',
        availability: freelancer.availability || '',
        bio: freelancer.bio || '',
      }));
  
      res.status(200).json(formattedFreelancers);
  
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      res.status(500).json({ message: `Error: ${err.message}` });
    }
  };

  const getFreelancerById = async (req, res) => {
    try {
      const { id } = req.params;

      const freelancers = await db.collection('users')
        .find({ userType: 'freelancer'
        , _id: new ObjectId(id)
         })
        .toArray();
  
      if (freelancers.length === 0) {
        return res.status(404).json({ message: "No freelancers found." });
      }
  
      const formattedFreelancers = freelancers.map((freelancer) => ({
        _id: freelancer._id.toString(),
        userType: freelancer.userType,
        name: freelancer.name,
        email: freelancer.email,
        skills: freelancer.skills || [],
        portfolioURL: freelancer.portfolioURL || '',
        hourlyRate: freelancer.hourlyRate || 0,
        location: freelancer.location || '',
        availability: freelancer.availability || '',
        experienceLevel: freelancer.experienceLevel || '',
        bio: freelancer.bio || '',
      }));
      res.status(200).json(formattedFreelancers);
  
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      res.status(500).json({ message: `Error: ${err.message}` });
    }
  };

  const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const receiver = req.user.id; 

      const users = await db.collection('users')
        .find({ _id: new ObjectId(id)
         })
        .toArray();
  
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found." });
      }
  
      const unreadCount = await db.collection('messages').countDocuments({
        from: id,
        to: receiver,
        isRead: false
      });

      const formattedUsers = users.map((user) => ({
        _id: user._id.toString(),
        userType: user.userType,
        name: user.name,
        email: user.email,
        unreadCount: unreadCount
      }));

      res.status(200).json( formattedUsers );
  
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      res.status(500).json({ message: `Error: ${err.message}` });
    }
  };

module.exports = { getFreelancer , getFreelancerById, getUserById };
