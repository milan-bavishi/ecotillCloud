const express = require("express");
const router = express.Router();
const WasteController = require("../controllers/wasteController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/waste";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  },
});

// Get waste statistics
router.get("/stats", protect, WasteController.getWasteStats);

// Report waste with image upload
router.post(
  "/report",
  protect,
  upload.single("image"),
  WasteController.reportWaste
);

// Get user's waste reports
router.get("/reports", protect, WasteController.getWasteReports);

// Get available collection tasks
router.get("/collection-tasks", protect, WasteController.getCollectionTasks);

// Accept a collection task
router.post(
  "/collection-tasks/:reportId/accept",
  protect,
  WasteController.acceptCollectionTask
);

// Verify a waste report (admin only)
router.post(
  "/reports/:reportId/verify",
  protect,
  WasteController.verifyWasteReport
);

module.exports = router;
