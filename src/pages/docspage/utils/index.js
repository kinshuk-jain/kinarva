import { ALLOWED_MAGIC_NUMBERS } from '../../../constants'

export const getViewportWidth = () =>
  Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

export const openOrSaveFile = (chunks, chunkName, type) => {
  const blob = new Blob(chunks, { type })
  const first4Bytes = new Uint8Array((chunks[0] || []).slice(0, 4))
  const magicNumberInHex = first4Bytes.reduce((acc, val) => {
    return (acc += val.toString(16))
  }, '')

  const saveFile = () => {
    if (window.navigator && window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob)
      return
    }
    const anchor = document.createElement('a')
    anchor.href = window.URL.createObjectURL(blob)
    anchor.download = chunkName
    anchor.click()
  }

  if (!ALLOWED_MAGIC_NUMBERS.includes(magicNumberInHex)) {
    // the file may contain virus so download file
    saveFile()
    return {
      hasVirus: true,
    }
  }

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob)
    return {}
  }

  const viewportWidth = getViewportWidth()
  const fileHref = window.URL.createObjectURL(blob)
  if (viewportWidth > 720) {
    return {
      fileHref,
      hasVirus: false,
    }
  } else {
    saveFile()
    return {}
  }
}

export const readStream = async (reader, progressUpdater) => {
  let chunks = []
  let receivedLength = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    receivedLength += value.length
    progressUpdater(receivedLength)
  }
  return chunks
}
