export function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) return next({ status: 400, message: 'Validation error', details: error.details });
    req[property] = value;
    next();
  };
}
