import axios from 'axios'

const api = axios.create({
  baseURL: 'https://goalgenie-ai.onrender.com',
})

// প্রতিটা request এ automatically token attach করে দেয় (যদি থাকে)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api;