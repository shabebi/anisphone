const branchModel = require("../models/branchModel");
const { success, created } = require("../utils/response");

async function getBranches(req, res) {
  const branches = await branchModel.getActiveBranches();

  return success(res, branches);
}

async function getBranch(req, res) {
  const branch = await branchModel.getBranchById(
    req.params.id
  );

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: "Branch not found.",
    });
  }

  return success(res, branch);
}

async function createBranch(req, res) {
  const branch = await branchModel.createBranch(
    req.body
  );

  return created(res, branch);
}

async function updateBranch(req, res) {
  const branch = await branchModel.updateBranch(
    req.params.id,
    req.body
  );

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: "Branch not found.",
    });
  }

  return success(res, branch);
}

async function deleteBranch(req, res) {
  const branch = await branchModel.deleteBranch(
    req.params.id
  );

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: "Branch not found.",
    });
  }

  return success(res, branch);
}

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
};