const express = require('express')
const database = require('./database/inmemdb')
const userRoutes = require('./src/routes/user.routes')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.all('*', (req, res, next) => {
  const method = req.method
  console.log(`Method ${method} has been called`)
  next()
})

app.use('/api', userRoutes)

app.all('*', (req, res) => {
  res.status(401).json({
    statusCode: 401,
    result: 'End-point not found',
  })
})

// hier express errorhandler toevoegen

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app
