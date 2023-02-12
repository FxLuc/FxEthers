const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })

const listedSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
    ref: 'Item'
  },
  state: {
    type: Number,
    min: 0,
    default: 4,
  },
  startTime: {
    type: String,
    default: '0'
  },
  endTime: {
    type: String,
    default: '0'
  },
  startPrice: {
    type: String,
    default: '0',
  },
  currentPrice: {
    type: String,
    default: '0',
  },
  seller: {
    type: String,
    length: 42,
    required: true,
    ref: 'Account'
  },
  bidder: {
    type: String,
    length: 42,
    required: true,
    ref: 'Account'
  },
  token_payment: {
    type: String,
    length: 42,
    required: true,
  },
  physical: {
    is_physical: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      maxlength: 64,
    },
    to: {
      type: String,
      maxlength: 64,
    },
    nowIn: {
      type: String,
      maxlength: 64,
    }
  },
})

module.exports = mongoose.model('Listed', listedSchema)
