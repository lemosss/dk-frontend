import axios from 'axios'

// Use direct backend URL to avoid proxy issues
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // console.log('Request to:', config.url, '- Token:', token ? token.substring(0, 20) + '...' : 'missing')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    //   console.log('Authorization header set:', config.headers.Authorization.substring(0, 30) + '...')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 received for:', error.config?.url)
    }
    return Promise.reject(error)
  }
)

export default api
