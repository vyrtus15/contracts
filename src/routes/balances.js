const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getProfile } = require("../middleware/getProfile");
const { addBalance } = require("../services/balances");

const router = express.Router();

router.post(
  "/deposit/:userId",
  getProfile,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const payload = req.body;

    await addBalance(userId, payload);

    res.json({ success: true });
  })
);

module.exports = router;
