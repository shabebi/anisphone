function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function created(res, data) {
  return success(res, data, 201);
}

module.exports = { success, created };
