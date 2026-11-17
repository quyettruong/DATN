import axios from 'axios';

const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleResponseError = (error) => {
  const isAuthRequest = error.config?.url?.includes('/auth/');
  if (error.response?.status === 401 && !isAuthRequest) {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error.response?.data || error);
};

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  attachToken,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  handleResponseError
);

// Some legacy pages import Axios directly. Keep their response shape intact,
// but ensure protected API calls still carry the active JWT.
axios.interceptors.request.use(attachToken, (error) => Promise.reject(error));
axios.interceptors.response.use((response) => response, handleResponseError);

export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

export default api;
