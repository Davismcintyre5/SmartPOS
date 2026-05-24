const Client = require("../../models/admin/Client");
const User = require("../../models/client/User");
const License = require("../../models/public/License");
const Product = require("../../models/client/Product");
const Sale = require("../../models/client/Sale");
const Customer = require("../../models/client/Customer");
const ApiKey = require("../../models/client/ApiKey");
const Backup = require("../../models/client/Backup");
const ClientCurrency = require("../../models/client/Currency");
const AISettings = require("../../models/client/AISettings");
const ClientSubscription = require("../../models/client/Subscription");
const Payment = require("../../models/admin/Payment");
const AppError = require("../../utils/AppError");
const logger = require("../../config/logger");

const getClients = async (filters = {}) => {
  const { status, plan, search, page = 1, limit = 20 } = filters;
  const query = {};
  if (status) query.status = status;
  if (plan) query.plan = plan;
  if (search) {
    query.$or = [
      { businessName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
    ];
  }
  const [clients, count] = await Promise.all([
    Client.find(query).sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
    Client.countDocuments(query),
  ]);
  return { clients, count, page: Number(page), pages: Math.ceil(count / limit) };
};

const getClientById = async (id) => {
  const client = await Client.findById(id).lean();
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

const updateClient = async (id, data) => {
  const client = await Client.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

const suspendClient = async (id) => {
  const client = await Client.findByIdAndUpdate(id, { status: "suspended" }, { new: true });
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

const activateClient = async (id) => {
  const client = await Client.findByIdAndUpdate(id, { status: "active" }, { new: true });
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

const deleteClient = async (id) => {
  const client = await Client.findById(id);
  if (!client) throw new AppError("Client not found", 404);

  const clientId = client._id;

  await Promise.all([
    User.deleteMany({ clientId }),
    License.deleteMany({ clientId }),
    Product.deleteMany({ clientId }),
    Sale.deleteMany({ clientId }),
    Customer.deleteMany({ clientId }),
    ApiKey.deleteMany({ clientId }),
    Backup.deleteMany({ clientId }),
    ClientCurrency.deleteMany({ clientId }),
    AISettings.deleteMany({ clientId }),
    ClientSubscription.deleteMany({ clientId }),
    Payment.deleteMany({ client: clientId }),
  ]);

  await Client.deleteOne({ _id: clientId });

  logger.info(`Client ${clientId} and all linked data deleted`);
  return client;
};

module.exports = { getClients, getClientById, updateClient, suspendClient, activateClient, deleteClient };