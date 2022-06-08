const {
  sequelize: {
    models: { Profile },
  },
} = require("../model");

const addBalance = async (userId, payload) => {
  const profile = await Profile.findOne({ where: { id: userId } });

  validateProfile(profile);
  validateBalance(payload);
  validateDepositAmount(profile.balance, payload.amount);

  await Profile.increment(
    { balance: payload.amount },
    { where: { id: userId } }
  );
};

const validateProfile = (profile) => {
  if (!profile || profile.type !== "client") {
    throw new Error("To deposit money target user should be a client");
  }
};

const validateBalance = (payload) => {
  const { amount } = payload;
  if (!amount || isNaN(amount)) {
    throw new Error("Amount is required");
  }

  if (amount <= 0) {
    throw new Error("Positive amount is required");
  }
};

const validateDepositAmount = (current, deposit) => {
  const maxDepositAmount = (current / 100) * 25; // 25% of current balance

  if (maxDepositAmount < deposit) {
    throw new Error("Max deposit amount is " + maxDepositAmount);
  }
};

module.exports = { addBalance };
