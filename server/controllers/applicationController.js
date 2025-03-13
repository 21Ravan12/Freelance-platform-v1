const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const { Application, Project } = require('../config/dbSchemas');


const db = getDb();

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err.message });
  }
};

const getApplicationsById = async (req, res) => {
  try {
    const { type, id } = req.params;

    let query = {};
    if (type === "job") {
      query = { jobId: new ObjectId(id)};
    } else if (type === "project") {
      query = { projectId: new ObjectId(id)};
    } else {
      return res.status(400).json({ message: "Invalid type. Must be 'job' or 'project'." });
    }

    const applications = await Application.find(query);

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err.message });
  }
};

const checkIfApplied = async (req, res) => {
  try {
    const { type, projectId } = req.body;
    const userId = req.user.id; 

    let query = {};
    if (type === "job") {
      query = { jobId: new ObjectId(projectId) };
    } else if (type === "project") {
      query = { projectId: new ObjectId(projectId) };
    } else {
      return res.status(400).json({ message: "Invalid type. Must be 'job' or 'project'." });
    }

    const applications = await Application.find(query);

    const hasApplied = applications.some((app) => app.userId.toString() === userId.toString());

    const response = {
      hasApplied,
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err.message });
  }
};

const addApplication = async (req, res) => {
  try {
    const { type, description, jobId, projectId, resume } = req.body;
    const userId = req.user.id; 

    if (!description || !resume || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (type === "job" && !jobId) {
      return res.status(400).json({ message: "jobId is required for job applications." });
    }

    if (type === "project" && !projectId) {
      return res.status(400).json({ message: "projectId is required for project applications." });
    }

    if (type === "job" && !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId." });
    }

    if (type === "project" && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    const newApplication = new Application({
      type,
      jobId: type === "job" ? jobId : null,
      projectId: type === "project" ? projectId : null,
      userId,
      description,
      resume,
    });

    if (type === "job") {
      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        { $inc: { applications: 1 } }
      );
    }

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!", application: newApplication });
  } catch (err) {
    console.error("Error in addApplication:", err.message);
    res.status(500).json({ message: "Error submitting application", error: err.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, resume } = req.body;

    const updateData = { name, email };
    if (resume) updateData.resume = resume;

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application updated successfully!", application: updatedApplication });
  } catch (err) {
    res.status(500).json({ message: "Error updating application", error: err.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting application", error: err.message });
  }
};

const acceptApplication = async (req, res) => {
  try {
    const { id, projectId } = req.params;
    console.log(id);

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: "accepted" }, 
      { new: true } 
    );

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { status: "closed" }, 
      { new: true } 
    );

    if (!updatedApplication || !updatedProject ) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application accepted successfully!", application: updatedApplication, application: updatedApplication});
  } catch (err) {
    res.status(500).json({ message: "Error accepting application", error: err.message });
  }
};


module.exports = {
  getApplications,
  getApplicationsById,
  addApplication,
  updateApplication,
  deleteApplication,
  acceptApplication,
  checkIfApplied,
};