const express = require('express')
const userController = require('../controllers/user.controller')
const router = express.Router()

// 201 register as a new user
router.post(
    '/user',
    userController.validateUser,
    userController.createUser
)
// 202 get all users
router.get('/user', userController.getAll)
// 203 get your personal user profile
router.get('/user/profile')
// 204 get a single user by id
router.get('/user/:id', userController.getById)
// 205 update a single user by id
router.put('/user/:id',
    userController.validateUser,
    userController.updateById)
// 206 delete a user
router.delete('/user/:id', userController.deleteById)

module.exports = router