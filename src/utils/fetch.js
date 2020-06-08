import 'whatwg-fetch'
import { storage } from './storage'

const DOMAIN = process.env.REACT_APP_API_URL

async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    const error = new Error(response.statusText)
    error.status = response.status
    error.response = await response.json()
    throw error
  }
}

export function refreshAccessToken() {
  return fetch(`${DOMAIN}/refresh-token`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
    .then(checkStatus)
    .then((r) => r.json())
    .catch((e) => {
      storage.setItem('accessToken', '')
      window.location.href = '/'
    })
}

async function refreshRequired(response, history) {
  const header = response.headers.get('WWW-Authenticate') || ''
  if (response.status === 401 && header.startsWith('Bearer')) {
    const { token } = await refreshAccessToken()
    storage.setItem('accessToken', token)
    return ''
  }
  return response
}

export async function fetchApi(url, options, history) {
  const requestOptions = () => ({
    mode: 'cors',
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${storage.getItem('accessToken')}`,
      ...options.headers,
    },
  })

  const fullUrl = `${DOMAIN}${url}`

  return fetch(fullUrl, requestOptions())
    .then((r) => refreshRequired(r, history))
    .then((r) => {
      if (!r) {
        return fetch(fullUrl, requestOptions())
      }
      return r
    })
    .then(checkStatus)
    .then((r) => r.json())
}
