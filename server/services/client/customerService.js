const Customer = require("../../models/client/Customer");
const AppError = require("../../utils/AppError");

const getCustomers = async (clientId, filters = {}) => {
  const { search, page = 1, limit = 50 } = filters;
  const query = { clientId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(query).sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
    Customer.countDocuments(query),
  ]);

  return { customers, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getCustomerById = async (clientId, id) => {
  const customer = await Customer.findOne({ _id: id, clientId }).lean();
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

const createCustomer = async (clientId, data) => {
  return Customer.create({ ...data, clientId });
};

const updateCustomer = async (clientId, id, data) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: id, clientId },
    data,
    { new: true, runValidators: true }
  );
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

const deleteCustomer = async (clientId, id) => {
  const customer = await Customer.findOneAndDelete({ _id: id, clientId });
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };