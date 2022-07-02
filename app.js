const express = require("express");
const database = require("./database/inmemdb");
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const mealRoutes = require("./src/routes/meal.routes");
const dbconnection = require("./database/dbconnection");
const logger = require("./src/config/config").logger;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.all("*", (req, res, next) => {
    const method = req.method;
    logger.debug(`Method ${method} has been called`);
    next();
});

app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", mealRoutes);

app.all("*", (req, res) => {
    res.status(401).json({
        statusCode: 401,
        result: "End-point not found",
    });
});

app.use((err, req, res, next) => {
    logger.debug("Error handler called.");
    res.status(500).json({
        statusCode: 500,
        message: err.toString(),
    });
});

app.listen(port, () => {
    logger.debug(`Example app listening on port ${port}`);
});

process.on("SIGINT", () => {
    logger.debug("SIGINT signal received: closing HTTP server");
    dbconnection.end((err) => {
        logger.debug("Database connection closed");
    });
    app.close(() => {
        logger.debug("HTTP server closed");
    });
});

module.exports = app;
