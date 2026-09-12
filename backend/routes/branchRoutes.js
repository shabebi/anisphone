const router = require("express").Router();

const branchController = require("../controllers/branchController");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/",
  asyncHandler(branchController.getBranches)
);

router.get(
  "/:id",
  asyncHandler(branchController.getBranch)
);

module.exports = router;