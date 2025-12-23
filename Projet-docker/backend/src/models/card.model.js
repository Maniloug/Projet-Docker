const { Schema, model } = require('mongoose');

const cardSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    series: { type: String, required: true },
    rarity: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [] },
    metadata: {
      hp: Number,
      abilities: [String],
      weakness: String,
    },
  },
  { timestamps: true }
);

module.exports = model('Card', cardSchema);
