import jwtDecode from 'jwt-decode'
import { storage } from './storage'
import { refreshAccessToken } from './fetch'

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
      window.location.href = '/'
    }
  }
}
