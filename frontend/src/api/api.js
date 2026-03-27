import axios from 'axios'

// Create a new axios instance with the base URL of the backend API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const API = axios.create({
    baseURL: BASE_URL,
})

// Interceptor to add the token to the request headers
API.interceptors.request.use((req) => {
    // If the token is in the local storage, add it to the request headers
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    }
    return req
})

export default API