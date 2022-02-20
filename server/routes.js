const router = require("express").Router();
const { body } = require("express-validator");

const { getRanking } = require("./controllers/getRanking")

router.get("/api/getRank", [body("ranking")], getRanking);
// router.post("api/getRank", function (req, res) {
//     getRanking
// })

router.get("/api/test", function (request, response) {
    response.send("Server is running");
});

module.exports = router;