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
        // Handle different error status codes
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
          throw new Error(errorData.detail || 'Not authenticated. Please log in again.');
        }
        
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If it's a network error (backend not running)
      if (error.message === 'Failed to fetch') {
        console.error('API Error: Backend server is not responding. Please ensure the backend is running on', API_BASE_URL);
        throw new Error('Backend server is not running. Please start the server and try again.');
      }
      
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

  // Provider profile endpoints
  async getProviderProfile() {
    return this.request('/providers/profile');
  }

  async updateProviderProfile(profileData) {
    return this.request('/providers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async createProviderProfile(profileData) {
    return this.request('/providers/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
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

  // Dashboard endpoints
  async getCustomerStats() {
    return this.request('/dashboard/customer/stats');
  }

  async getProviders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.service) params.append('service', filters.service);
    if (filters.location) params.append('location', filters.location);
    if (filters.min_rating) params.append('min_rating', filters.min_rating);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/dashboard/customer/providers${query}`);
  }

  async getCustomerBookings(statusFilter = null) {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request(`/dashboard/customer/bookings${query}`);
  }

  async saveProvider(providerPhone) {
    return this.request('/dashboard/customer/save-provider', {
      method: 'POST',
      body: JSON.stringify({ provider_phone: providerPhone }),
    });
  }

  async unsaveProvider(providerPhone) {
    return this.request('/dashboard/customer/unsave-provider', {
      method: 'POST',
      body: JSON.stringify({ provider_phone: providerPhone }),
    });
  }

  async getProviderStats() {
    return this.request('/dashboard/provider/stats');
  }

  async getProviderPendingRequests() {
    return this.request('/dashboard/provider/pending-requests');
  }

  async getProviderAcceptedJobs() {
    return this.request('/dashboard/provider/accepted-jobs');
  }

  async acceptBooking(bookingId) {
    return this.request('/dashboard/provider/accept-booking', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async rejectBooking(bookingId) {
    return this.request('/dashboard/provider/reject-booking', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async cancelJob(bookingId) {
    return this.request('/dashboard/provider/cancel-job', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async createBooking(bookingData) {
    return this.request('/dashboard/customer/create-booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async verifyAcceptanceCode(bookingId, code) {
    return this.request('/dashboard/customer/verify-acceptance-code', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, code }),
    });
  }

  async completeBooking(bookingId) {
    return this.request('/dashboard/customer/complete-booking', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async createReview(reviewData) {
    return this.request('/dashboard/customer/create-review', {
      method: 'POST',
      body: JSON.stringify(reviewData),
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
}

export default new ApiService();
