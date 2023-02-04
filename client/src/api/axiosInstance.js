/* eslint-disable dot-notation */
/* eslint-disable no-param-reassign */
import axios from 'axios'
import { API_BASE_URI } from '../utils'

const axiosInstance = axios.create({
  baseURL: API_BASE_URI,
  timeout: 5 * 1000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('jwt_token')
//   if (token) {
//     config.headers['Authorization'] = `Bearer ${token}`
//   }
//   return config
// })

// axiosInstance.interceptors.response.use(
//   (response) => response?.data,
//   (error) => {
//     if (error?.response?.data?.statusCode === 401) {
//       localStorage.removeItem('jwt_token')
//     }
//     return error?.response?.data
//   },
// )

export { axiosInstance }
