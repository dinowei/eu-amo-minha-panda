const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url:      { type: String, required: true },
  caption:  { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
