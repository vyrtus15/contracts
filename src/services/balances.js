const { fn, col, Op } = require("sequelize");
const {
  sequelize: {
    models: { Profile, Contract, Job },
  },
} = require("../model");

const addBalance = async (userId, payload) => {
  const profile = await Profile.findOne({ where: { id: userId } });

  validateProfile(profile);
  validateBalance(payload);
  await validateDepositAmount(profile.id, payload.amount);

  await Profile.increment(
    { balance: payload.amount },
    { where: { id: userId } }
  );
};

const validateProfile = (profile) => {
  if (!profile || profile.type !== "client") {
    throw new Error("BAD REQUEST: To deposit money target user should be a client");
  }
};

const validateBalance = (payload) => {
  const { amount } = payload;
  if (!amount || isNaN(amount)) {
    throw new Error("BAD REQUEST: Amount is required");
  }

  if (amount <= 0) {
    throw new Error("BAD REQUEST: Positive amount is required");
  }
};

const validateDepositAmount = async (clientId, deposit) => {
  const jobsToBePaid = await Contract.findAll({
    raw: true,
    attributes: ["ClientId", [fn("SUM", col("Jobs.price")), "amount"]],
    group: "ClientId",
    where: {
      ClientId: clientId,
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

  const amountToPayInTotal = jobsToBePaid[0]?.amount || 0;
  const maxDepositAmount = (amountToPayInTotal / 100) * 25; // 25% of the total amount to pay

  if (maxDepositAmount < deposit) {
    throw new Error("BAD REQUEST: Max deposit amount is " + maxDepositAmount);
  }
};

module.exports = { addBalance };
