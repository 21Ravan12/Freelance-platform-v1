const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const { connectToDatabase } = require('./config/db'); 
const { authenticateToken } = require('./middlewares/auth');

const privateKey = fs.readFileSync('C:/Users/User/key-no-passphrase.pem', 'utf8');
const certificate = fs.readFileSync('C:/Users/User/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

connectToDatabase()
  .then(() => {
    console.log('MongoDB connection established');
    const { getOngoingProjects, addOngoingProject, updateOngoingProject, deleteOngoingProject, getOngoingProjectById, completeOngoingProjectById } = require('./controllers/ongoingProjects');
    const { getProjects, addProject, updateProject, deleteProject, getProjectById, getYourProjects } = require('./controllers/projectController');
    const { getApplications, getApplicationsById, addApplication, updateApplication, deleteApplication, acceptApplication, checkIfApplied } = require('./controllers/applicationController');
    const { getJobs, addJobs, updateJobs, deleteJobs, getJobById, getYourJobs } = require('./controllers/jobController');
    const { getAccountSettings, updateAccountSettings, changePassword, deleteAccount } = require('./controllers/settingsController');
    const { registerUser, completeRegistration, saveUserDetails, requestPasswordReset, verifyRecoveryCode, loginUser, getProfile, updateProfile, refreshPassword } = require('./controllers/userController');
    const { getFreelancer , getFreelancerById, getUserById } = require('./controllers/freelancerController');
    const { getChatMessages, getChatMessagesToMe, getUnreadMessagesCount, readMyMessages } = require('./controllers/messageController');

    app.post('/api/signup/sendCode', registerUser);
    app.post('/api/signup/verifyCode', authenticateToken, completeRegistration);
    app.post('/api/signup/saveDetails', authenticateToken, saveUserDetails);
    app.post('/api/login', loginUser);
    app.post('/api/resetPassword/sendCode', requestPasswordReset);
    app.post('/api/resetPassword/verifyCode', authenticateToken, verifyRecoveryCode);
    app.post('/api/resetPassword/reset', authenticateToken, refreshPassword);

    app.get('/api/profile/get', authenticateToken, getProfile);
    app.put('/api/profile/update', authenticateToken, updateProfile);
    app.get('/api/users/:id', authenticateToken, getUserById);

    app.get('/api/settings/get', authenticateToken, getAccountSettings);
    app.put('/api/settings/update', authenticateToken, updateAccountSettings);
    app.put('/api/settings/changePassword', authenticateToken, changePassword);
    app.delete('/api/settings/delete', authenticateToken, deleteAccount);

    app.get('/api/jobs', authenticateToken, getJobs);
    app.get('/api/jobs/yours', authenticateToken, getYourJobs);
    app.post('/api/jobs', authenticateToken, addJobs);
    app.put('/api/jobs/:id', authenticateToken, updateJobs);
    app.delete('/api/jobs/:id', authenticateToken, deleteJobs);
    app.get('/api/jobs/:id', authenticateToken, getJobById);

    app.get('/api/projects', authenticateToken, getProjects);
    app.get('/api/projects/yours', authenticateToken, getYourProjects);
    app.post('/api/projects', authenticateToken, addProject);
    app.put('/api/projects/:id', authenticateToken, updateProject);
    app.delete('/api/projects/:id', authenticateToken, deleteProject);
    app.get('/api/projects/:id', authenticateToken, getProjectById);

    app.get('/api/ongoingProjects/:type', authenticateToken, getOngoingProjects);
    app.post('/api/ongoingProjects/:projectId/:freelancerId', authenticateToken, addOngoingProject);
    app.put('/api/ongoingProjects/:id', authenticateToken, updateOngoingProject);
    app.delete('/api/ongoingProjects/:id', authenticateToken, deleteOngoingProject);
    app.get('/api/ongoingProjectsById/:id', authenticateToken, getOngoingProjectById);
    app.put('/api/completeOngoingProjectById', authenticateToken, completeOngoingProjectById);

    app.get('/api/applications', authenticateToken, getApplications);
    app.get('/api/applications/:type/:id', authenticateToken, getApplicationsById);
    app.post('/api/applications', authenticateToken, addApplication);
    app.put('/api/applications/:id', authenticateToken, updateApplication);
    app.delete('/api/applications/:id', authenticateToken, deleteApplication);
    app.put('/api/applications/accept/:id/:projectId', authenticateToken, acceptApplication);
    app.post('/api/applications/checkIfApplied', authenticateToken, checkIfApplied);

    app.get('/api/freelancers', authenticateToken, getFreelancer);
    app.get('/api/freelancers/:id', authenticateToken, getFreelancerById);

    app.get('/api/messages', authenticateToken, getChatMessagesToMe);
    app.get('/api/messages/:sender/:receiver', authenticateToken, getChatMessages);
    app.get('/api/messages/unreadCount', authenticateToken, getUnreadMessagesCount);
    app.patch('/api/messages', authenticateToken, readMyMessages);

    const PORT = process.env.PORT || 3002;
    https.createServer(credentials, app).listen(PORT, '0.0.0.0', () => {
      console.log(`HTTPS server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); 
  });