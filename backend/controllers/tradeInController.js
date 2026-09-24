const TradeIn = require("../models/tradeInModel");
const authModel = require("../models/authModel");

async function createTradeIn(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Never trust name/phone sent by the browser.
    // They always come from the authenticated users table record.
    const user = await authModel.findById(userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User account not found or inactive.",
      });
    }

    const {
      device_type,
      brand,
      model,
      storage,
      account_free,
      working,
      surface_condition,
      screen_condition,
      body_condition,
      complete,
      battery_capacity,
      notes,
      language,
    } = req.body;

    const requiredFields = [
      "device_type",
      "brand",
      "model",
      "storage",
      "battery_capacity",
    ];

    for (const field of requiredFields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        String(req.body[field]).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    const conditionFields = [
      "account_free",
      "working",
      "surface_condition",
      "screen_condition",
      "body_condition",
      "complete",
    ];

    for (const field of conditionFields) {
      if (typeof req.body[field] !== "boolean") {
        return res.status(400).json({
          success: false,
          message: `${field} must be true or false`,
        });
      }
    }

    const cleanPhone = String(user.phone || "").replace(/\D/g, "");

    if (!/^7\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "The phone number saved on the account is invalid.",
      });
    }

    const tradeIn = await TradeIn.createTradeInRequest({
      user_id: user.id,
      device_type: String(device_type).trim(),
      brand: String(brand).trim(),
      model: String(model).trim(),
      storage: String(storage).trim(),
      account_free,
      working,
      surface_condition,
      screen_condition,
      body_condition,
      complete,
      battery_capacity: String(battery_capacity).trim(),
      name: String(user.name || "").trim(),
      phone: cleanPhone,
      notes:
        notes !== undefined && notes !== null
          ? String(notes).trim()
          : null,
      language: language === "en" ? "en" : "ar",
    });

    return res.status(201).json({
      success: true,
      message: "Trade-in request submitted successfully",
      data: tradeIn,
    });
  } catch (error) {
    console.error("Create trade-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit trade-in request",
    });
  }
}

async function getTradeIns(req, res) {
  try {
    const requests = await TradeIn.getAllTradeInRequests();

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get trade-ins error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load trade-in requests",
    });
  }
}

async function getTradeIn(req, res) {
  try {
    const request = await TradeIn.getTradeInRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Trade-in request not found",
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get trade-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load trade-in request",
    });
  }
}

async function updateTradeIn(req, res) {
  try {
    const { status, admin_notes } = req.body;

    const allowedStatuses = [
      "pending",
      "contacted",
      "accepted",
      "rejected",
      "completed",
    ];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trade-in status",
      });
    }

    const updated = await TradeIn.updateTradeInRequest(req.params.id, {
      status,
      admin_notes,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Trade-in request not found",
      });
    }

    return res.json({
      success: true,
      message: "Trade-in request updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update trade-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trade-in request",
    });
  }
}

async function deleteTradeIn(req, res) {
  try {
    const deleted = await TradeIn.deleteTradeInRequest(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Trade-in request not found",
      });
    }

    return res.json({
      success: true,
      message: "Trade-in request deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Delete trade-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trade-in request",
    });
  }
}

module.exports = {
  createTradeIn,
  getTradeIns,
  getTradeIn,
  updateTradeIn,
  deleteTradeIn,
};
