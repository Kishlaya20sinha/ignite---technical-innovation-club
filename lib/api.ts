export const API_URL = (import.meta as any).env?.VITE_API_URL ||
    ((import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://ignite-technical-innovation-club.onrender.com');

export const api = {
    // Generic fetch wrapper
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('ignite_admin_token');

        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> || {}),
        };

        // Don't set Content-Type for FormData, let browser handle it with boundary
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
    },

    get: (endpoint: string) => api.request(endpoint),
    post: (endpoint: string, body: any) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any) => api.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string) => api.request(endpoint, { method: 'DELETE' }),

    // Auth
    login: (data: any) => api.request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => api.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    verifyOTP: (data: { email: string, otp: string }) => api.request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    completeProfile: (data: any) => api.request('/api/auth/complete-profile', { method: 'POST', body: JSON.stringify(data) }),
    verifyToken: () => api.request('/api/auth/verify'),

    // Recruitment
    submitApplication: (data: any) => api.request('/api/recruit', { method: 'POST', body: JSON.stringify(data) }),
    getApplications: () => api.request('/api/recruit'),
    updateApplicationStatus: (id: string, status: string) => api.request(`/api/recruit/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteApplication: (id: string) => api.request(`/api/recruit/${id}`, { method: 'DELETE' }),

    // Events
    getEvents: () => api.request('/api/events'),
    getAllEvents: () => api.request('/api/events/all'),
    createEvent: (data: any) => api.request('/api/events', {
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    updateEvent: (id: string, data: any) => api.request(`/api/events/${id}`, {
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    deleteEvent: (id: string) => api.request(`/api/events/${id}`, { method: 'DELETE' }),
    registerForEvent: (data: any) => api.request('/api/events/register', { method: 'POST', body: JSON.stringify(data) }),
    getRegistrations: () => api.request('/api/events/registrations'),

    // Exam
    addQuestion: (data: any) => api.request('/api/exam/questions', { method: 'POST', body: JSON.stringify(data) }),
    addQuestionsBulk: (questions: any[]) => api.request('/api/exam/questions/bulk', { method: 'POST', body: JSON.stringify({ questions }) }),
    generateQuestions: (topic: string, count: number = 5) => api.request('/api/exam/questions/generate', { method: 'POST', body: JSON.stringify({ topic, count }) }),
    getAllQuestions: () => api.request('/api/exam/questions/all'),
    updateQuestion: (id: string, data: any) => api.request(`/api/exam/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteQuestion: (id: string) => api.request(`/api/exam/questions/${id}`, { method: 'DELETE' }),
    startExam: (data: any) => api.request('/api/exam/start', { method: 'POST', body: JSON.stringify(data) }),
    submitExam: (data: any) => api.request('/api/exam/submit', { method: 'POST', body: JSON.stringify(data) }),
    logViolation: (data: any) => api.request('/api/exam/violation', { method: 'POST', body: JSON.stringify(data) }),
    sendExamWarning: (submissionId: string, message: string) => api.request('/api/exam/warning', { method: 'POST', body: JSON.stringify({ submissionId, message }) }),
    getExamStatus: (submissionId: string) => api.request(`/api/exam/status/${submissionId}`),
    getExamConfig: () => api.request('/api/exam/config'),
    updateExamConfig: (data: any) => api.request('/api/exam/config', { method: 'POST', body: JSON.stringify(data) }),
    getSubmissions: () => api.request('/api/exam/submissions'),
    getActiveExams: () => api.request('/api/exam/active'),
    addExamTime: (data: { submissionId: string, minutes: number }) => api.request('/api/exam/add-time', { method: 'POST', body: JSON.stringify(data) }),
    addExamTimeAll: (minutes: number) => api.request('/api/exam/add-time-all', { method: 'POST', body: JSON.stringify({ minutes }) }),
    resetAllSubmissions: () => api.request('/api/exam/reset-all', { method: 'DELETE' }),
    exportResultsCSVUrl: () => `${API_URL}/api/exam/export?token=${localStorage.getItem('ignite_admin_token')}`,
    forceSubmitExam: (submissionId: string) => api.request('/api/exam/force-submit', { method: 'POST', body: JSON.stringify({ submissionId }) }),
    syncAnswers: (data: { submissionId: string, answers: any[] }) => api.request('/api/exam/update-answers', { method: 'POST', body: JSON.stringify(data) }),
    getAllowlist: () => api.request('/api/exam/allowlist'),
    addToAllowlist: (data: any) => api.request('/api/exam/allowlist', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: (email: string) => api.request(`/api/user/profile/${email}`),
    getEventQR: (id: string) => api.request(`/api/events/${id}/qr`),
    markAttendance: (data: { eventId: string, email: string }) => api.request('/api/events/attend', { method: 'POST', body: JSON.stringify(data) }),
    uploadCertificateTemplate: (id: string, data: FormData) => api.request(`/api/events/${id}/certificate-template`, { method: 'POST', body: data }),
    previewCertificate: (id: string) => api.request(`/api/events/${id}/certificate-preview`),
    generateCertificates: (id: string) => api.request(`/api/events/${id}/generate-certificates`, { method: 'POST' }),

    // Gallery
    getGallery: () => api.request('/api/gallery'),
    addGalleryItem: (data: FormData) => api.request('/api/gallery', { method: 'POST', body: data }),
    updateGalleryItem: (id: string, data: FormData) => api.request(`/api/gallery/${id}`, { method: 'PUT', body: data }),
    deleteGalleryItem: (id: string) => api.request(`/api/gallery/${id}`, { method: 'DELETE' }),

    // Team
    getTeam: () => api.request('/api/team'),
    getAllTeam: () => api.request('/api/team/all'),
    addTeamMember: (data: any) => api.request('/api/team', { method: 'POST', body: JSON.stringify(data) }),
    updateTeamMember: (id: string, data: any) => api.request(`/api/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTeamMember: (id: string) => api.request(`/api/team/${id}`, { method: 'DELETE' }),

    // Admin Users
    getAdminUsers: () => api.request('/api/admin/users'),

    // System Config
    getConfig: (key: string) => api.request(`/api/config/${key}`),
    setConfig: (key: string, value: any) => api.request('/api/config', { method: 'POST', body: JSON.stringify({ key, value }) }),
};
