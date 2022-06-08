const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getBestClients, getBestProfessions } = require("../services/admin");

const router = express.Router();

router.get(
  "/best-profession",
  asyncHandler(async (req, res) => {
    const { start, end } = req.query;

    const response = await getBestProfessions(start, end);

    res.json(response);
  })
);

router.get(
  "/best-clients",
  asyncHandler(async (req, res) => {
    const response = await getBestClients(req.query);

    res.json(response);
  })
);

module.exports = router;
