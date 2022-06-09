const { Op, col, fn, literal } = require("sequelize");

const {
  sequelize: {
    models: { Profile, Job, Contract },
  },
} = require("../model");

const getBestProfessions = async (options) => {
  const professionsByAmount = await Profile.findAll({
    raw: true,
    attributes: [
      "profession",
      [fn("SUM", col("Contractor->Jobs.price")), "price"],
    ],
    where: { type: "contractor" },
    group: "profession",
    order: literal(`price DESC`),
    include: [
      {
        model: Contract,
        as: "Contractor",
        required: true,
        include: [
          {
            model: Job,
            required: true,
            where: {
              paid: true,
              paymentDate: { [Op.between]: [options.start, options.end] },
            },
          },
        ],
      },
    ],
  });

  return professionsByAmount.map((c) => ({
    profession: c.profession,
    price: c.price,
  }));
};

const getBestClients = async (options) => {
  const topClients = await topClientsByAmount(options);
  const profiles = await getProfiles(topClients.map((c) => c.clientId));

  return joinClientsMetadata(topClients, profiles);
};

const topClientsByAmount = async (options) => {
  const limit = options.limit && !isNaN(options.limit) ? options.limit : 2;

  const clientsByAmount = await Contract.findAll({
    raw: true,
    attributes: ["ClientId", [fn("SUM", col("Jobs.price")), "price"]],
    group: "ClientId",
    order: literal(`price DESC LIMIT ${limit}`),
    include: [
      {
        model: Job,
        required: true,
        where: {
          paid: true,
          paymentDate: { [Op.between]: [options.start, options.end] },
        },
      },
    ],
  });

  return clientsByAmount.map((c) => ({ clientId: c.ClientId, price: c.price }));
};

const getProfiles = async (ids) => {
  const profiles = await Profile.findAll({
    where: { id: { [Op.in]: ids } },
  });

  return profiles;
};

const joinClientsMetadata = (topClients, profiles) => {
  const clients = topClients.map((c) => {
    const profile = profiles.find((p) => p.id === c.clientId);
    return {
      id: c.clientId,
      fullName: `${profile.firstName} ${profile.lastName}`,
      paid: c.price,
    };
  });

  return clients;
};

module.exports = { getBestProfessions, getBestClients };
