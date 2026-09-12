function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A record with the same unique value already exists."
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "The referenced record does not exist or cannot be deleted."
    });
  }

  if (err.code === "23514" || err.code === "22P02") {
    return res.status(400).json({
      success: false,
      message: "Invalid data supplied."
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error." : err.message
  });
}

module.exports = errorHandler;
