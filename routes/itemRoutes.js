// routes/itemRoutes.js

const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const Item = require("../models/itemModel");

// Get all items for logged-in user
router.get("/items", isAuthenticated, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Add new item
router.post("/items", isAuthenticated, async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    // Validation
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const newItem = new Item({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      userId: req.user._id,
      status: "active"
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Error adding item" });
  }
});

// Update item
router.put("/items/:id", isAuthenticated, async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const { id } = req.params;

    // Find item and verify ownership
    const item = await Item.findOne({ _id: id, userId: req.user._id });
    
    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    // Validation
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Update item
    item.name = name;
    item.category = category;
    item.price = Number(price);
    item.quantity = Number(quantity);

    await item.save();
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating item" });
  }
});

// Delete item
router.delete("/items/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete item (verify ownership)
    const item = await Item.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting item" });
  }
});

// Toggle item status (active/completed)
router.patch("/items/:id/toggle", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Find item and verify ownership
    const item = await Item.findOne({ _id: id, userId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    // Toggle status
    item.status = item.status === "active" ? "completed" : "active";
    await item.save();

    res.json(item);
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Error toggling status" });
  }
});

// Clear completed items
router.delete("/items/clear-completed", isAuthenticated, async (req, res) => {
  try {
    const result = await Item.deleteMany({ 
      userId: req.user._id, 
      status: "completed" 
    });

    res.json({ 
      message: `${result.deletedCount} completed items cleared`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error clearing completed items:", error);
    res.status(500).json({ message: "Error clearing completed items" });
  }
});

// Clear all items
router.delete("/items/clear-all", isAuthenticated, async (req, res) => {
  try {
    const result = await Item.deleteMany({ userId: req.user._id });

    res.json({ 
      message: `All ${result.deletedCount} items cleared`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error clearing all items:", error);
    res.status(500).json({ message: "Error clearing all items" });
  }
});

module.exports = router;