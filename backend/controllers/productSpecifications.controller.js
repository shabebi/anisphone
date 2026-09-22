const productSpecificationsModel = require("../models/productSpecifications.model");
const { query } = require("../db");

const getUserId = (req) => req.user?.userId || req.user?.id || req.user?.user_id;

const requireAdmin = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const result = await query(
      `SELECT role FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (!result.rows.length || result.rows[0].role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateProductId = (req, res, next) => {
  if (!req.params.productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }
  next();
};

const normalizeSpecification = (item, index = 0) => ({
  section_ar: item?.section_ar ?? "",
  section_en: item?.section_en ?? "",
  name_ar: item?.name_ar ?? "",
  name_en: item?.name_en ?? "",
  value_ar: item?.value_ar ?? "",
  value_en: item?.value_en ?? "",
  sort_order:
    Number.isFinite(Number(item?.sort_order))
      ? Number(item.sort_order)
      : index,
});

const getSpecifications = async (req, res, next) => {
  try {
    const rows = await productSpecificationsModel.listSpecifications(
      req.params.productId
    );

    res.json({ specifications: rows });
  } catch (error) {
    next(error);
  }
};

const replaceSpecifications = async (req, res, next) => {
  try {
    const raw = req.body?.specifications;

    if (!Array.isArray(raw)) {
      return res.status(400).json({
        message: "specifications must be an array.",
      });
    }

    const specifications = raw.map(normalizeSpecification);

    const rows = await productSpecificationsModel.replaceSpecifications(
      req.params.productId,
      specifications
    );

    res.json({
      message: "Product specifications saved successfully.",
      specifications: rows,
    });
  } catch (error) {
    next(error);
  }
};

const addSpecification = async (req, res, next) => {
  try {
    const specification = await productSpecificationsModel.createSpecification(
      req.params.productId,
      normalizeSpecification(req.body)
    );

    res.status(201).json({
      message: "Specification created successfully.",
      specification,
    });
  } catch (error) {
    next(error);
  }
};

const editSpecification = async (req, res, next) => {
  try {
    const specification = await productSpecificationsModel.updateSpecification(
      req.params.specificationId,
      req.params.productId,
      normalizeSpecification(req.body)
    );

    if (!specification) {
      return res.status(404).json({
        message: "Specification not found.",
      });
    }

    res.json({
      message: "Specification updated successfully.",
      specification,
    });
  } catch (error) {
    next(error);
  }
};

const removeSpecification = async (req, res, next) => {
  try {
    const deleted = await productSpecificationsModel.deleteSpecification(
      req.params.specificationId,
      req.params.productId
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Specification not found.",
      });
    }

    res.json({
      message: "Specification deleted successfully.",
      id: deleted.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  validateProductId,
  getSpecifications,
  replaceSpecifications,
  addSpecification,
  editSpecification,
  removeSpecification,
};
