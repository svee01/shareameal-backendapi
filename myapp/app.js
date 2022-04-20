const express = require('express');
const app = express();
const port = process.enc.PORT || 3000;

// Respond with Hello World! on the homepage:

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api', (req, res) => {
  res.send('PP funni');
});

// 201: register as a new user

app.post('/api/user', (req, res) => {
  res.send('new user info');
});

// 202: get all users

app.get('/api/user', (req, res) => {
  res.send('all users');
});

// 203: request personal user profile

app.get('/api/user/profile', (req, res) => {
  res.send('personal user profile');
});

// 204: get single user by id

app.get('/api/user/{id}', (req, res) => {
  res.send('single user');
});

// 205: update a single user

app.put('/api/user/{id}', (req, res) => {
  res.send('updated user profile');
});

// 206: delete a user

app.delete('/api/user', (req, res) => {
  res.send('deleted user profile');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
