const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const { Project, OngoingProjects } = require('../config/dbSchemas');

const db = getDb();

const getOngoingProjects = async (req, res) => {
  try {
    const { type } = req.params;
    const id = req.user.id; 
    console.log(type,id);
    let query = {};
    if (type === 'freelancer') {
      query.freelancerId = id;
    } else if (type === 'employer') {
      query.companyId = id;
    }

    const ongoingProjects = await OngoingProjects.find(query);
    res.status(200).json(ongoingProjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
};

const addOngoingProject = async (req, res) => {
    try {
      const { projectId, freelancerId } = req.params;
  
      const project = await Project.findById(new ObjectId(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      const { 
        title, 
        description, 
        company, 
        requiredTechnologies, 
        payment,
        deadline, 
        companyId,
      } = project;
  
      if (!title || !description || !company || !requiredTechnologies || !payment || !companyId || !freelancerId || !deadline) {
        return res.status(400).json({ message: "Missing required fields in the project" });
      }
  
      const startDate = new Date();
  
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + deadline);
  
      const newOngoingProjects = new OngoingProjects({ 
        title, 
        description, 
        company, 
        requiredTechnologies, 
        payment, 
        deadline: deadlineDate, 
        companyId,
        freelancerId: new ObjectId(freelancerId),
        startDate, 
      });
  
      await newOngoingProjects.save();
  
      res.status(201).json({ 
        message: "Project added to ongoing projects successfully", 
        project: newOngoingProjects 
      });
    } catch (err) {
      console.error("Error adding project to ongoing projects:", err);
      res.status(500).json({ message: "Error adding project to ongoing projects", error: err.message });
    }
  };

const updateOngoingProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredTechnologies, payment, deadline, tasks, freelancerId } = req.body;
    const updatedOngoingProject = await OngoingProjects.findByIdAndUpdate(
      id,
      { title, description, requiredTechnologies, payment, deadline, tasks, freelancerId },
      { new: true }
    );
    res.status(200).json(updatedOngoingProject);
  } catch (err) {
    res.status(500).json({ message: "Error updating project", error: err.message });
  }
};

const deleteOngoingProject = async (req, res) => {
  try {
    const { id } = req.params;
    await OngoingProjects.findByIdAndDelete(id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
};

const completeOngoingProjectById = async (req, res) => {
  try {
    const { projectId, isCompleteFromFreelancer, isCompleteFromEmployer } = req.body;

    console.log(projectId);

    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const ongoingProject = await OngoingProjects.findOne({ _id: new ObjectId(projectId) });
    
    if (!ongoingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    ongoingProject.isCompleteFromFreelancer = isCompleteFromFreelancer || ongoingProject.isCompleteFromFreelancer;
    ongoingProject.isCompleteFromEmployer = isCompleteFromEmployer || ongoingProject.isCompleteFromEmployer;
    if (isCompleteFromEmployer) {
      ongoingProject.status = "Completed";
    }

    await ongoingProject.save();

    res.status(200).json({ message: "Project updated successfully", project: ongoingProject });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ message: "Error updating project", error: err.message });
  }
};

const getOngoingProjectById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
  
      const ongoingProject = await OngoingProjects.find({ _id: new ObjectId(id) });
      console.log(ongoingProject);
      if (!ongoingProject || ongoingProject.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json(ongoingProject[0]); 
    } catch (err) {
      console.error("Error fetching project:", err);
      res.status(500).json({ message: "Error fetching project", error: err.message });
    }
};

module.exports = {
  getOngoingProjects,
  addOngoingProject,
  updateOngoingProject,
  deleteOngoingProject,
  getOngoingProjectById,
  completeOngoingProjectById,
};