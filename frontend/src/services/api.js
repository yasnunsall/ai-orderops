import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

export const getOrders = () => api.get('/orders/')
export const getOrder = (id) => api.get(`/orders/${id}`)
export const getProducts = () => api.get('/products/')
export const getCriticalProducts = () => api.get('/products/critical')
export const getDelayedShipments = () => api.get('/shipments/delayed')
export const getDailySummary = () => api.get('/summary/daily')
export const sendChatMessage = (message) => api.post('/chat/', { message })

export default api
