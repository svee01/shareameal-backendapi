const express = require('express').Router()
const mealController = require('../controllers/meal.controller')

// 301 register a meal
router.post('/meal', mealController.validateMovie, mealController.createMovie)
// 303 get a single meal by id
router.get('/meal/:id', mealController.getById)
// 304 update a single meal
router.put('/meal/:id', mealController.validateMovie, mealController.)
// 305 delete meal
router.delete('/meal/:id', mealController.)

module.exports = routes