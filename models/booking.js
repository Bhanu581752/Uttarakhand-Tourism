 const mongoose = require('mongoose');


const bookingSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link booking to user
  destination: String,
  date: Date,
  persons: Number,

});

module.exports = mongoose.model("Booking", bookingSchema);
