// controllers/client/customerController.js
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const Customer = require("../../models/client/Customer");

// @desc    Get all customers (with search)
// @route   GET /api/client/customers
// @access  Private (Client)
const getCustomers = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filter = { clientId: req.clientId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { loyaltyCardNumber: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  success(res, { customers, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc    Get single customer
// @route   GET /api/client/customers/:id
// @access  Private (Client)
const getCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, clientId: req.clientId }).lean();
  if (!customer) throw new AppError("Customer not found", 404);
  success(res, customer);
});

// @desc    Create customer
// @route   POST /api/client/customers
// @access  Private (Client)
const createCustomer = catchAsync(async (req, res) => {
  const data = { ...req.body, clientId: req.clientId };

  // Auto-assign loyalty card number if not provided
  if (!data.loyaltyCardNumber) {
    const year = new Date().getFullYear();
    const lastCustomer = await Customer.findOne({
      clientId: req.clientId,
      loyaltyCardNumber: new RegExp(`^${year}`),
    }).sort({ loyaltyCardNumber: -1 }).lean();

    if (lastCustomer && lastCustomer.loyaltyCardNumber) {
      const lastNumber = parseInt(lastCustomer.loyaltyCardNumber.slice(4)) || 0;
      data.loyaltyCardNumber = `${year}${String(lastNumber + 1).padStart(4, "0")}`;
    } else {
      data.loyaltyCardNumber = `${year}0001`;
    }
  }

  const customer = await Customer.create(data);
  success(res, customer, "Customer created", 201);
});

// @desc    Update customer
// @route   PUT /api/client/customers/:id
// @access  Private (Client)
const updateCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, clientId: req.clientId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!customer) throw new AppError("Customer not found", 404);
  success(res, customer, "Customer updated");
});

// @desc    Delete customer
// @route   DELETE /api/client/customers/:id
// @access  Private (Client)
const deleteCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, clientId: req.clientId });
  if (!customer) throw new AppError("Customer not found", 404);
  success(res, null, "Customer deleted");
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };