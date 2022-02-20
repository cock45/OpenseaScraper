const cors = require('cors');
const express = require('express');
const routes = require('./routes.js');
const app = express();

// const db = require("./models");
// db.sequelize.sync();

app.use(cors());
app.options('*', cors());
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(routes);
// Handling Errors
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

app.listen(3001, () => console.log('Server is running on port 3001'));