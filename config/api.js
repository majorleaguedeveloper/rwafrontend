export const API_BASE_URL = 'http://localhost:5000/api';

export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Loan endpoints
  LOANS: '/loans',
  USER_LOANS: '/loans/user',
  GUARANTOR_REQUESTS: '/loans/guarantor-requests',
  GUARANTEE_SUMMARY: '/loans/guarantee-summary',
  
  // Investment endpoints
  INVESTMENTS: '/investments',
  USER_INVESTMENTS: '/investments/user',
  
  // Contribution endpoints
  CONTRIBUTIONS: '/contributions',
  USER_CONTRIBUTIONS: '/contributions/user',
  
  // Department endpoints
  DEPARTMENTS: '/departments',
  
  // User endpoints
  USERS: '/users',
  PROFILE: '/users/profile',
}; 