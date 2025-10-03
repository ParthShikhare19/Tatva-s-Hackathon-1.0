const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // OTP endpoints
  async sendOtp(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  async resendOtp(phone) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  // Token management
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  async getProviderProfile(userId) {
    return this.request(`/providers/${userId}/profile`);
  }

  async getProviderPendingRequests(userId) {
    return this.request(`/providers/${userId}/pending-requests`);
  }

  async getProviderAcceptedJobs(userId) {
    return this.request(`/providers/${userId}/accepted-jobs`);
  }

  async getProviderCompletedJobs(userId) {
    return this.request(`/providers/${userId}/completed-jobs`);
  }

  async acceptJobRequest(requestId) {
    return this.request(`/jobs/${requestId}/accept`, {
      method: 'POST'
    });
  }

  async rejectJobRequest(requestId) {
    return this.request(`/jobs/${requestId}/reject`, {
      method: 'POST'
    });
  }

  async completeJob(jobId) {
    return this.request(`/jobs/${jobId}/complete`, {
      method: 'POST'
    });
  }
}

export default new ApiService();
