export const DISALLOWED_MIME_TYPES = [
  'application/octet-stream',
  'application/x-javascript',
  'application/x-msaccess',
  'application/x-ms-application',
  'application/java-archive',
  'application/postscript',
  'text/vbscript',
  'text/html',
  /video\/.*/,
  /audio\/.*/,
]

export const ALLOWED_MAGIC_NUMBERS = [
  '47494638', // gif
  '89504e47', // png
  'ffd8ffe0', // jpg
  'ffd8ffe1', // jpg
  'ffd8ffe2', // jpg
  'ffd8ffe3', // jpg
  'ffd8ffe8', // jpg
  '7b5c7274', // rtf
  'd0cf11e0', // xls/doc/ppt
  '504b0304', // xlsx/docx/pptx
  '25504446', // pdf
  '7b226572' // pdf
]
