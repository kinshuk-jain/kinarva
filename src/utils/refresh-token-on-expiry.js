import jwtDecode from 'jwt-decode'
import { storage } from './storage'
import { refreshAccessToken } from './fetch'

const LOGIN_ROUTE = '/'
export async function refreshTokenOnExpiry(callback = () => {}) {
  if (storage.getItem('accessToken')) {
    try {
      const decoded = jwtDecode(storage.getItem('accessToken'))
      const currTime = new Date().getTime() / 1000
      if (currTime >= decoded.exp) {
        const { token } = await refreshAccessToken()
        storage.setItem('accessToken', token)
      }
      callback()
    } catch (e) {
      storage.setItem('accessToken', '')
      window.location.href = LOGIN_ROUTE
    }
  } else if (window.location.pathname !== LOGIN_ROUTE) {
    window.location.href = LOGIN_ROUTE
  }
}
