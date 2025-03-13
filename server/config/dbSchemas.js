const mongoose = require('mongoose');
const { mongoUri, dbName } = require('../config/config');

mongoose.connect(`${mongoUri}/${dbName}`)
  .then(() => console.log('Connected to MongoDB with Mongoose'))
  .catch(err => console.error('MongoDB connection error:', err));

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  requiredTechnologies: { type: [String], required: true }, 
  payment: {
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      required: true,
      enum: ["USD", "EUR", "TRY", "AZN"], 
      default: "USD"
    }
  },  status: { type: String, enum: ["open", "closed"], default: "open" },
  deadline: { type: Number, required: true },
  postedDate: { type: Date, default: Date.now },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Project = mongoose.model("Project", projectSchema);

const ongoingProjectsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  requiredTechnologies: { type: [String], required: true },
  payment: {
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      required: true,
      enum: ["USD", "EUR", "TRY", "AZN"], 
      default: "USD" // Varsayılan para birimi
    }
  },  status: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" },
  postedDate: { type: Date, default: Date.now },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deadline: { type: Date }, 
  isCompleteFromFreelancer: { type: Boolean, default: false },
  isCompleteFromEmployer: { type: Boolean, default: false },
  tasks: [{
    id: { type: Number },
    title: { type: String },
    completed: { type: Boolean },
  }], 
});

const OngoingProjects = mongoose.model("OngoingProjects", ongoingProjectsSchema);

const applicationSchema = new mongoose.Schema({
  type: { type: String, enum: ["job", "project"], required: true }, 
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, 
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, 
  userId: { type: mongoose.Schema.Types.ObjectId }, 
  description: { type: String, required: true },
  resume: { type: String, required: true },
  status: { type: String, required: false }, 
  appliedDate: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", applicationSchema);

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true }, 
  location: { type: String, required: true }, 
  salary: { type: String, required: true }, 
  requiredTechnologies: { type: [String], required: true }, 
  salary: {
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      required: true,
      enum: ["USD", "EUR", "TRY", "AZN"], 
      default: "USD"
    }
  },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  applications: { type: Number, default: 0 },
  postedDate: { type: Date, default: Date.now },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Job = mongoose.model("Job", jobSchema);

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Project, Application, Job, Message, OngoingProjects };