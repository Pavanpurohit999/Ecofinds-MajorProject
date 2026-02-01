const express = require("express");
const router = express.Router();
const {
  getSimilarProducts,
  getUserRecommendations,
  getFrequentlyBoughtTogether, // ⬅️ add this
} = require("../controllers/recommendation.controller.js");

router.get("/similar/:productId", getSimilarProducts);
router.get("/user/:userId", getUserRecommendations);
router.get(
  "/frequently-bought-together/:productId",
  getFrequentlyBoughtTogether
);

module.exports = router;
