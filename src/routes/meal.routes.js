const router = require("express").Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");

// 301 register a meal
router.post(
    "/meal",
    authController.validateToken,
    mealController.validateMovie,
    mealController.createMovie
);
// 302 update a meal by id
router.put(
    "meal/:id",
    authController.validateToken,
    mealController.validateMovie,
    mealController.updateById
);
// 303 list of meals
router.get("/meal", authController.validateToken, mealController.getAll);
// 304 get meal by id
router.get("/meal/:id", authController.validateToken, mealController.getById);
// 305 delete meal
router.delete(
    "/meal/:id",
    authController.validateToken,
    mealController.deleteById
);

module.exports = router;
