import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const studentToken = localStorage.getItem('studentToken');
    const adminUser = localStorage.getItem('adminUser');
    const studentUser = localStorage.getItem('studentUser');

    // Clear conflicting tokens
    if (adminUser && studentToken && !studentUser) {
      localStorage.removeItem('studentToken');
    }
    if (studentUser && adminToken && !adminUser) {
      localStorage.removeItem('adminToken');
    }

    // If admin is logged in, use admin token
    if (adminUser && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } 
    // Otherwise if student is logged in, use student token
    else if (studentUser && studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('studentToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('studentUser');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getProfile: () => api.get('/admin/profile'),
  getAssessments: () => api.get('/assessments'),
  getPublishedAssessments: () => api.get('/assessments/published'),
  getAssessment: (id) => api.get(`/assessments/${id}`),
  createAssessment: (data) => api.post('/assessments', data),
  updateAssessment: (id, data) => api.put(`/assessments/${id}`, data),
  togglePublish: (id) => api.patch(`/assessments/${id}/toggle`),
  deleteAssessment: (id) => api.delete(`/assessments/${id}`),
  resetAttempts: (id) => api.post(`/assessments/${id}/reset-attempts`),
  getQuestions: (assessmentId) => api.get(`/questions/assessment/${assessmentId}`),
  addQuestion: (data) => api.post('/questions', data),
  bulkUploadQuestions: (assessmentId, questions) => 
    api.post('/questions/bulk-upload', { assessment_id: assessmentId, questions }),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  getStudents: (search) => api.get(`/students${search ? `?search=${search}` : ''}`),
  getStudentProgress: (id) => api.get(`/students/${id}/progress`),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  getSubmissions: () => api.get('/submissions'),
  getSubmissionDetails: (id) => api.get(`/submissions/${id}`),
  getOverviewStats: () => api.get('/analytics/overview'),
  getAssessmentAnalytics: () => api.get('/analytics/assessments'),
  getStudentReport: (studentId) => api.get(`/reports/student/${studentId}`, { responseType: 'blob' }),
  getAssessmentReport: (assessmentId) => api.get(`/reports/assessment/${assessmentId}`, { responseType: 'blob' }),
  getClassReport: () => api.get('/reports/class', { responseType: 'blob' }),
  updateProfile: (data) => api.put('/profile/admin', data),
  uploadProfilePic: (id, formData) => api.post(`/profile/upload-pic/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const studentAPI = {
  register: (data) => api.post('/students/register', data),
  login: (data) => api.post('/students/login', data),
  getProfile: () => api.get('/students/profile'),
  getPublishedAssessments: () => api.get('/assessments/published'),
  getAssessment: (id) => api.get(`/assessments/${id}`),
  getQuestions: (assessmentId) => api.get(`/questions/assessment/${assessmentId}`),
  submitAssessment: (data) => api.post('/submissions/submit', data),
  getSubmissions: (studentId) => api.get(`/submissions/student/${studentId}`),
  getSubmissionDetails: (id) => api.get(`/submissions/${id}`),
  updateProfile: (id, data) => api.put(`/profile/student/${id}`, data),
  uploadProfilePic: (id, formData) => api.post(`/profile/upload-pic/student/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;