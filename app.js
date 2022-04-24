const express = require('express')
const database = require('./database/inmemdb')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

let id = 0

app.all('*', (req, res, next) => {
  const method = req.method
  console.log(`Method ${method} has been called`)
  next()
})

app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    result: 'Hello World',
  })
})

app.get('/api', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    result: 'PP funni',
  })
})

// 201: register as a new user

app.post('/api/user', (req, res) => {
  
  database.createUser(req.body, (error, result) => {
    if (error) {
      console.log(`app.js: ${error}`)
      res.status(401).json({
        statusCode: 401,
        result,
      })
    }
  
    if (result) {
      console.log(`app.js: user successfully added!`)
      res.status(200).json({
        statusCode: 200,
        result,
      })
    }
  })
})

// 202: get all users

app.get('/api/user', (req, res) => {
  database.listUsers((error, result) => {
    if (error) {
      console.log(`app.js ${error}`)
      res.status(401).json({
        statusCode: 401,
        result,
      })
    }

    if (result) {
      console.log(`app.js: list of users successfully printed!`)
      res.status(200).json({
        statusCode: 200,
        result,
      })
    }
  })
})

// 203: request personal user profile

app.get('/api/user/profile', (req, res) => {
  res.send('personal user profile: nog niet gerealiseerd')
})

// 204: get single user by id

app.get('/api/user/:id', (req, res) => {
  console.log(req.params.id)

  database.getUserById(req.params.id, (error, result) => {
    if (error) {
      console.log(`app.js: ${error}`)
      res.status(401).json({
        statusCode: 401,
        result,
      })
    }

    if (result) {
      console.log(`app.js: user successfully printed by ID!`)
      res.status(200).json({
        statusCode: 200,
        result,
      })
    }
  })
})

// 205: update a single user

app.put('/api/user/:id', (req, res) => {
  console.log(req.params.id)

  database.updateUser(req.params.id, (error, result) => {
    if (error) {
      console.log(`app.js: ${error}`)
      res.status(401).json({
        statusCode: 401,
        result,
      })
    }

    if (result) {
      console.log(`app.js: user successfully updated by ID!`)
      res.status(200).json({
        statusCode: 200,
        result,
      })
    }
  })
})

// 206: delete a user

app.delete('/api/user/:id', (req, res) => {
  console.log(req.params.id)

  database.deleteUser(req.params.id, (error, result) => {
    if (error) {
      console.log(`app.js: ${error}`)
      res.status(401).json({
        statusCode: 401,
        result,
      })
    }

    if (result) {
      console.log(`app.js: user successfully deleted by ID!`)
      res.status(200).json({
        statusCode: 200,
        result,
      })
    }
  })
})

app.all('*', (req, res) => {
  res.status(401).json({
    statusCode: 401,
    result: 'End-point not found',
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
