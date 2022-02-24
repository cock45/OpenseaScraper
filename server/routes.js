const router = require("express").Router();
const { body } = require("express-validator");

const { getRanking } = require("./controllers/getRanking")

router.post("/api/getRank", [body("period", "pageNum")], getRanking);

router.get("/api/test", function (request, response) {
    response.send("Server is running");
});

module.exports = router;