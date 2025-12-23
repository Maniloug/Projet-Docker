const { Schema, model } = require('mongoose');

const cartSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    items: [
      {
        card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Cart', cartSchema);
