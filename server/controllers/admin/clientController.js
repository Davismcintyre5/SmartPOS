const catchAsync = require("../../utils/catchAsync");
const { success } = require("../../utils/apiResponse");
const clientService = require("../../services/admin/clientService");

// @desc    Get all clients
// @route   GET /api/admin/clients
// @access  Private (Admin)
const getClients = catchAsync(async (req, res) => {
  const result = await clientService.getClients(req.query);
  success(res, result);
});

// @desc    Get single client
// @route   GET /api/admin/clients/:id
// @access  Private (Admin)
const getClient = catchAsync(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);
  success(res, { client });
});

// @desc    Update client
// @route   PUT /api/admin/clients/:id
// @access  Private (Admin)
const updateClient = catchAsync(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  success(res, { client }, "Client updated");
});

// @desc    Suspend client
// @route   PUT /api/admin/clients/:id/suspend
// @access  Private (Admin)
const suspendClient = catchAsync(async (req, res) => {
  const client = await clientService.suspendClient(req.params.id);
  success(res, { client }, "Client suspended");
});

// @desc    Activate client
// @route   PUT /api/admin/clients/:id/activate
// @access  Private (Admin)
const activateClient = catchAsync(async (req, res) => {
  const client = await clientService.activateClient(req.params.id);
  success(res, { client }, "Client activated");
});

// @desc    Delete client
// @route   DELETE /api/admin/clients/:id
// @access  Private (Superadmin)
const deleteClient = catchAsync(async (req, res) => {
  await clientService.deleteClient(req.params.id);
  success(res, null, "Client deleted");
});

module.exports = { getClients, getClient, updateClient, suspendClient, activateClient, deleteClient };