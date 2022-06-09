const { Op } = require("sequelize");
const {
  sequelize: {
    models: { Contract },
  },
} = require("../model");

const getUserContractById = async (profileId, contractId) => {
  const contract = await Contract.findOne({
    where: {
      id: contractId,
      [Op.or]: [
        {
          ClientId: profileId,
        },
        {
          ContractorId: profileId,
        },
      ],
    },
  });

  return contract;
};

const getUserActiveContracts = async (profileId) => {
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        {
          ClientId: profileId,
        },
        {
          ContractorId: profileId,
        },
      ],
      status: {
        [Op.not]: "terminated",
      },
    },
  });

  return contracts;
};

module.exports = { getUserContractById, getUserActiveContracts };
