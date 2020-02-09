import 'whatwg-fetch'

const DOMAIN = process.env.NODE_ENV === 'production' ? 'https://api.sharedocs.in' : 'http://localhost:8080';

async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.status = response.status
    error.response = await response.json();
    throw error;
  }
}

export function refreshAccessToken() {
  return fetch('/refresh-token', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
  })
  .then(checkStatus)
  .then(r => r.json())
  .catch(e => {
    window.kinarvaStore.accessToken = ''
    window.location.href = '/';
  });
}

async function refreshRequired(response, history) {
  const header = response.headers.get('WWW-Authenticate') || '';
  if(response.status === 401 && header.startsWith('Bearer')) {
    const { token } = await refreshAccessToken();
    window.kinarvaStore.accessToken = token;
    return ''
  }
  return response
}

export async function fetchApi(url, options, history) {
  const requestOptions = () => ({
    mode: 'cors',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Bearer ${window.kinarvaStore.accessToken}`,
      ...options.headers
    }
  });

  const fullUrl = `${DOMAIN}${url}`

  return fetch(fullUrl, requestOptions())
  .then(r => refreshRequired(r, history))
  .then(r => {
    if (!r) {
      return fetch(fullUrl, requestOptions())
    }
    return r
  })
  .then(checkStatus)
  .then(r => r.json())
}
