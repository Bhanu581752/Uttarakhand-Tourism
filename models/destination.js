const mongoose = require("mongoose");




const destinationSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  duration: String,
  price: Number
});

module.exports = mongoose.model("Destination", destinationSchema);
