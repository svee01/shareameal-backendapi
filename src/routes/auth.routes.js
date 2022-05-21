const routes = require('express').Router()
const authController = require('../controllers/authentication.controller')

// 101 login
routes.post('/auth/login', authController.validateLogin, authController.login)

module.exports = routes