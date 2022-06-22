const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

// 201 register as a new user
router.post("/user", userController.validateUser, userController.createUser);
// 202 get all users
router.get("/user", authController.validateToken, userController.getAll);
// 203 get your personal user profile
router.get(
    "/user/profile",
    authController.validateToken,
    userController.getPersonalProfile
);
// 204 get a single user by id
router.get("/user/:id", authController.validateToken, userController.getById);
// 205 update a single user by id
router.put(
    "/user/:id",
    authController.validateToken,
    userController.validateUser,
    userController.updateById
);
// 206 delete a user
router.delete(
    "/user/:id",
    authController.validateToken,
    userController.deleteById
);

module.exports = router;
