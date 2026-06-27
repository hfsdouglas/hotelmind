import axios from 'axios'
import { API_URL } from '@/config/env'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && localStorage.getItem('hotelmind:session')) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
    return Promise.reject(err)
  }
)
