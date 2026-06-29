function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' })
}

function errorMiddleware(error, req, res, next) {
  console.error(error)
  if (res.headersSent) {
    return next(error)
  }

  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  })
}

module.exports = { notFoundHandler, errorMiddleware }
