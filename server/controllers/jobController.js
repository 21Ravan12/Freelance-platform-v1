const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const { Job } = require('../config/dbSchemas');

const db = getDb();

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs", error: err.message });
  }
};

const getYourJobs = async (req, res) => {
  try {
    const id = req.user.id;  

    const jobs = await Job.find({companyId: id});
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs", error: err.message });
  }
};

const addJobs = async (req, res) => {
  try {
    const { title, description, location, salary, requiredTechnologies, status } = req.body;
    const companyId = req.user.id;  

    const users = await db.collection('users').findOne({ _id: new ObjectId(companyId) });
    const company = users.companyName;

    const newJob = new Job({ title, description, company, location, salary, status, requiredTechnologies, companyId });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: "Error creating job", error: err.message });
  }
};

const updateJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, requiredTechnologies, salary } = req.body;
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { title, description, location, requiredTechnologies, salary },
      { new: true }
    );
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: "Error updating job", error: err.message });
  }
};

const deleteJobs = async (req, res) => {
  try {
    const { id } = req.params;
    await Job.findByIdAndDelete(id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job", error: err.message });
  }
};

module.exports = {
  getJobs,
  addJobs,
  updateJobs,
  deleteJobs,
  getJobById,
  getYourJobs,
};