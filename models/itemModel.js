// models/itemModel.js

const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    minlength: [2, "Item name must be at least 2 characters"]
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Beverages", "Snacks", "Other"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Item", itemSchema);