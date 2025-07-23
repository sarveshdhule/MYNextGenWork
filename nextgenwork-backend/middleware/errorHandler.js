module.exports = (err, req, res, next) => {
  console.error(err); // This will print the full error object/stack
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};