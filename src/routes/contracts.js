const express = require("express");
const { getProfile } = require("../middleware/getProfile");
const { asyncHandler } = require("../middleware/asyncHandler");
const {
  getUserContractById,
  getUserActiveContracts,
} = require("../services/contracts");

const router = express.Router();

router.get(
  "/:id",
  getProfile,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { id: profileId } = req.profile;

    const contract = await getUserContractById(profileId, id);
    if (!contract) {
      return res.status(404).end();
    }

    res.json(contract);
  })
);

router.get(
  "/",
  getProfile,
  asyncHandler(async (req, res) => {
    const { id: profileId } = req.profile;

    const contracts = await getUserActiveContracts(profileId);

    res.json(contracts);
  })
);

module.exports = router;
