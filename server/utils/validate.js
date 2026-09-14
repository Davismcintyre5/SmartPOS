const ApiError = require('./ApiError');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.validated = parsed;
      next();
    } catch (err) {
      const details = err.errors?.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      })) || [];
      next(ApiError.badRequest('Validation failed', details));
    }
  };
}

module.exports = validate;