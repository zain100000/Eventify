/**
 * @fileoverview Express routes for Super Admin authentication and profile management.
 *
 * Routes:
 * - POST /signup-super-admin → Register a new Super Admin.
 * - POST /signin-super-admin → Authenticate and log in.
 * - GET /get-super-admin-by-id/:id → Fetch Super Admin details.
 * - POST /logout-super-admin → Logout and clear session.
 *
 * @module routes/superAdminRoutes
 * @requires express
 * @requires ../../middlewares/auth-middleware/auth.middleware
 * @requires ../../utilities/cloudinary-utility/cloudinary.utility
 * @requires ../../controllers/super-admin-controller/super-admin.controller
 */

const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const profilePictureUpload = require("../../utilities/cloudinary-utility/cloudinary.utility");
const superAdminController = require("../../controllers/super-admin-controller/super-admin.controller");

/**
 * @description Route for Super Admin registration.
 */
router.post(
  "/signup-super-admin",
  profilePictureUpload.upload,
  superAdminController.registerSuperAdmin,
);

/**
 * @description Route for Super Admin sign-in.
 */
router.post(
  "/signin-super-admin",
  authLimiter,
  superAdminController.loginSuperAdmin,
);

/**
 * @description Route to get a Super Admin's details by ID.
 */
router.get(
  "/get-super-admin-by-id/:superAdminId",
  authMiddleware,
  superAdminController.getSuperAdminById,
);

/**
 * @description Route for Super Admin logout.
 */
router.post(
  "/logout-super-admin",
  authMiddleware,
  superAdminController.logoutSuperAdmin,
);

module.exports = router;
