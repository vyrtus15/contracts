const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { getProfile } = require("../middleware/getProfile");
const { getUnpaidJobs, payJob } = require("../services/jobs");

const router = express.Router();

router.get(
  "/unpaid",
  getProfile,
  asyncHandler(async (req, res) => {
    const jobs = await getUnpaidJobs(req.profile);

    res.json(jobs);
  })
);

router.post(
  "/:job_id/pay",
  getProfile,
  asyncHandler(async (req, res) => {
    const { id } = req.profile;
    const { job_id } = req.params;

    await payJob(id, job_id);

    res.json({ success: true });
  })
);

module.exports = router;
