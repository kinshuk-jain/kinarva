// we use node to serve the project in prod
const express = require('express')
const path = require('path')
const app = express()
const helmet = require('helmet')
const awsServerlessExpress = require('aws-serverless-express')

const binaryMimeTypes = [
  'application/octet-stream',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/gif',
  'image/vnd.microsoft.icon',
  'application/pdf'
]

app.use(helmet())

app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '30d'
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes)

exports.handler = (event, context) =>
  awsServerlessExpress.proxy(server, event, context)
