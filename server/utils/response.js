function success(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function created(res, data = null, message = 'Created') {
  return success(res, data, message, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function paginated(res, items, meta, message = 'OK') {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta
  });
}

module.exports = { success, created, noContent, paginated };