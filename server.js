// we use node to serve the project in prod

if (process.env.NODE_ENV === 'production') {
  const express = require('express')
  const path = require('path')
  const app = express()
  const helmet = require('helmet')

  app.use(helmet())

  app.use(express.static(path.join(__dirname, 'build')))

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })

  app.listen(3000)
}
