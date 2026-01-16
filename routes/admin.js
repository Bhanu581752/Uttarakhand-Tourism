const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");

const Destination = require("../models/destination");
const User = require("../models/user");
const Booking = require("../models/booking");

// ➕ Add destination
router.post("/destination", isAdmin, async (req, res) => {

    const { name, image, description, duration, price } = req.body;
    await Destination.create({ name, image, description, duration, price });
    res.send("✅ Destination added");

});

// ✏️ Update destination
router.put("/destination/:id", isAdmin, async (req, res) => {
  try {
    await Destination.findByIdAndUpdate(req.params.id, req.body);
    res.send("✅ Destination updated");
  } catch (err) {
    res.status(500).send("❌ Error updating destination");
  }
});

// 🗑️ Delete destination
router.delete("/destination/:id", isAdmin, async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.send("✅ Destination deleted");
  } catch (err) {
    res.status(500).send("❌ Error deleting destination");
  }
});

// 👥 View all users
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send("❌ Error fetching users");
  }
});

// 📑 View all bookings
router.get("/bookings", isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).send("❌ Error fetching bookings");
  }
});

module.exports = router;
