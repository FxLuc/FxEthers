const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })
const defaultPicture = 'default.jpg'

const itemSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 32,
  },
  description: {
    type: String,
    maxlength: 2048,
  },
  pictures: [{
    file: {
      type: String,
      default: defaultPicture,
    },
    raw_base64_encode: {
      type: String,
    },
    hashed_raw: {
      type: String,
      length: 66,
      required: true,
      // default: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
  }],
  properties: [{
    name: {
      type: String,
      maxlength: 32,
      required: true,
    },
    value: {
      type: String,
      maxlength: 32,
      required: true,
    }
  }],
  thumbnail: {
    type: String,
  },
  external_url: {
    type: String,
  },
  contract_address: {
    type: String,
    length: 42,
    required: true,
  },
  token_id: {
    type: String,
    required: true,
  },
  owned_by: {
    type: String,
    length: 42,
    required: true,
    ref: 'Account'
  },
  hashedMetadata: {
    type: String,
    length: 66,
    required: true,
    // default: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
})

module.exports = mongoose.model('Item', itemSchema)
