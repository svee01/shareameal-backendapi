const express = require('express').Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

// 301 register a meal
router.post('/meal', mealController.validateMovie, mealController.createMovie)
// 303 get a single meal by id
router.get('/meal/:id', mealController.getById)
// 304 update a single meal
router.put('/meal/:id', authController.validateToken, mealController.validateMovie, mealController.updateById)
// 305 delete meal
router.delete('/meal/:id', authController.validateToken, mealController.deleteById)

module.exports = routes