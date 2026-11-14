const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const uploadsDir = path.join(__dirname, '../../uploads');

const deleteImageFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadsDir, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting image file:', err.message);
    }
  });
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate('seller', 'name contactNumber')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email contactNumber'
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !description || price === undefined || !category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image: req.file ? req.file.filename : undefined,
      seller: req.user.id,
    });

    const populated = await product.populate('seller', 'name email contactNumber');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    if (req.file) deleteImageFile(req.file.filename);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id.toString()) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, description, price, category } = req.body;

    if (req.file) {
      // Delete old image if exists
      if (product.image) deleteImageFile(product.image);
      product.image = req.file.filename;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;

    const updated = await product.save();
    const populated = await updated.populate('seller', 'name email contactNumber');
    res.json(populated);
  } catch (err) {
    console.error(err);
    if (req.file) deleteImageFile(req.file.filename);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    if (product.image) deleteImageFile(product.image);

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
