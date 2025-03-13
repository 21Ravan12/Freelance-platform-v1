const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const { Project, Application } = require('../config/dbSchemas');

const db = getDb();

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    const projectsWithApplications = await Promise.all(
      projects.map(async (project) => {
        const applicationCount = await Application.countDocuments({
          projectId: project._id, 
        });

        return {
          ...project.toObject(), 
          applications: applicationCount, 
        };
      })
    );

    res.status(200).json(projectsWithApplications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
};

const getYourProjects = async (req, res) => {
  try {
    const id = req.user.id;

    const projects = await Project.find({ companyId: new ObjectId(id) });
    console.log(projects);

    const projectsWithApplications = await Promise.all(
      projects.map(async (project) => {
        const applicationCount = await Application.countDocuments({
          projectId: project._id,
        });

        const payment = {
          amount: project.payment.amount,
          currency: project.payment.currency,
        };

        return {
          ...project.toObject(),
          payment, 
          applications: applicationCount,
        };
      })
    );

    res.status(200).json(projectsWithApplications);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
};

const addProject = async (req, res) => {
  try {
    const { title, description, requiredTechnologies, status, payment, deadline } = req.body;
    const companyId = req.user.id;

    const user = await db.collection('users').findOne({ _id: new ObjectId(companyId) });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const companyName = user.companyName;

    if (!payment || typeof payment !== 'object' || !payment.amount || !payment.currency) {
      return res.status(400).json({ message: "Invalid payment format. Expected { amount: number, currency: string }." });
    }

    const newProject = {
      title,
      description,
      company: companyName,
      requiredTechnologies: Array.isArray(requiredTechnologies) ? requiredTechnologies : requiredTechnologies.split(',').map(tech => tech.trim()),
      status: status || "open", 
      payment: {
        amount: parseFloat(payment.amount), 
        currency: payment.currency, 
      },
      deadline: parseInt(deadline), 
      companyId: new ObjectId(companyId),
    };

    const result = await db.collection('projects').insertOne(newProject);

    res.status(201).json({
      _id: result.insertedId,
      ...newProject,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredTechnologies, payment, deadline } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { title, description, requiredTechnologies, payment, deadline },
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: "Error updating project", error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const applications = await Application.countDocuments({
      projectId: new mongoose.Types.ObjectId(id),
    });

    const projectWithApplications = {
      ...project.toObject(),
      applications: applications,
    };

    if (project.payment && typeof project.payment === "string") {
      const paymentParts = project.payment.split(" ");
      projectWithApplications.payment = {
        amount: parseFloat(paymentParts[0]),
        currency: paymentParts[1],
      };
    }

    console.log(projectWithApplications);

    res.status(200).json(projectWithApplications);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ message: "Error fetching project", error: err.message });
  }
};

module.exports = {
  getProjects,
  getYourProjects,
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
};