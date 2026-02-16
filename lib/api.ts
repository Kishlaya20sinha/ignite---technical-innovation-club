const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export const api = {
    // Generic fetch wrapper
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('ignite_admin_token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
    },

    // Auth
    login: (password: string) => api.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
    verifyToken: () => api.request('/api/auth/verify'),

    // Recruitment
    submitApplication: (data: any) => api.request('/api/recruit', { method: 'POST', body: JSON.stringify(data) }),
    getApplications: () => api.request('/api/recruit'),
    updateApplicationStatus: (id: string, status: string) => api.request(`/api/recruit/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    deleteApplication: (id: string) => api.request(`/api/recruit/${id}`, { method: 'DELETE' }),

    // Events
    getEvents: () => api.request('/api/events'),
    getAllEvents: () => api.request('/api/events/all'),
    createEvent: (data: any) => api.request('/api/events', { method: 'POST', body: JSON.stringify(data) }),
    updateEvent: (id: string, data: any) => api.request(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEvent: (id: string) => api.request(`/api/events/${id}`, { method: 'DELETE' }),
    registerForEvent: (data: any) => api.request('/api/events/register', { method: 'POST', body: JSON.stringify(data) }),
    getRegistrations: () => api.request('/api/events/registrations'),

    // Exam
    addQuestion: (data: any) => api.request('/api/exam/questions', { method: 'POST', body: JSON.stringify(data) }),
    addQuestionsBulk: (questions: any[]) => api.request('/api/exam/questions/bulk', { method: 'POST', body: JSON.stringify({ questions }) }),
    getAllQuestions: () => api.request('/api/exam/questions/all'),
    deleteQuestion: (id: string) => api.request(`/api/exam/questions/${id}`, { method: 'DELETE' }),
    startExam: (data: any) => api.request('/api/exam/start', { method: 'POST', body: JSON.stringify(data) }),
    submitExam: (data: any) => api.request('/api/exam/submit', { method: 'POST', body: JSON.stringify(data) }),
    logViolation: (data: any) => api.request('/api/exam/violation', { method: 'POST', body: JSON.stringify(data) }),
    getSubmissions: () => api.request('/api/exam/submissions'),

    // Team
    getTeam: () => api.request('/api/team'),
    getAllTeam: () => api.request('/api/team/all'),
    addTeamMember: (data: any) => api.request('/api/team', { method: 'POST', body: JSON.stringify(data) }),
    updateTeamMember: (id: string, data: any) => api.request(`/api/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTeamMember: (id: string) => api.request(`/api/team/${id}`, { method: 'DELETE' }),
};
