const { Op } = require("sequelize");

const {
  sequelize: {
    models: { Job, Contract, Profile },
  },
  sequelize,
} = require("../model");

const getUnpaidJobs = async (profile) => {
  const key = profile.type === "client" ? "ClientId" : "ContractorId";

  const jobs = await Contract.findAll({
    where: {
      [key]: profile.id,
      status: "in_progress",
    },
    include: [
      {
        model: Job,
        required: true,
        where: {
          paid: { [Op.or]: [false, null] },
        },
      },
    ],
  });

  const response = jobs.map((job) => job.Jobs).flat();

  return response;
};

const payJob = async (profileId, jobId) => {
  const job = await Job.findOne({
    where: { id: jobId },
    include: { all: true },
  });
  if (!job) {
    throw new Error("Job not found");
  }

  const clientId = job.Contract.ClientId;
  const contractorId = job.Contract.ContractorId;
  if (clientId !== profileId) {
    throw new Error("You are not the client of this job");
  }

  await pay(clientId, contractorId, job);
};

const pay = async (clientId, contractorId, job) => {
  try {
    await sequelize.transaction(async () => {
      await Profile.increment(
        { balance: job.price },
        { where: { id: contractorId } }
      );
      await Profile.increment(
        { balance: -job.price },
        { where: { id: clientId } }
      );
      await Job.update(
        { paid: true, paymentDate: new Date() },
        { where: { id: job.id } }
      );
    });
  } catch (error) {
    if (error.original.code === "SQLITE_CONSTRAINT") {
      throw new Error("Not enough money");
    }

    throw new Error("Something went wrong");
  }
};

module.exports = { getUnpaidJobs, payJob };
