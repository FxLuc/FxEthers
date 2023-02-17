const mongoose = require("mongoose")
const { DEFAULT_PICTURE_DB } = require("../configs/constants")

const accountSchema = new mongoose.Schema({
  _id: {
    type: String,
    length: 42,
    required: true,
  },
  name: {
    type: String,
    default: 'Unnamed',
    maxlength: 32,
  },
  bio: {
    type: String,
    maxlength: 128,
  },
  external_url: {
    type: String,
    maxlength: 64,
  },
  avatar: {
    type: String,
    default: DEFAULT_PICTURE_DB,
  },
  avatar_thumb: {
    type: String,
    default: DEFAULT_PICTURE_DB,
  },
  // cover_photo: {
  //   type: String,
  //   default: DEFAULT_PICTURE_DB,
  // },
}, { timestamps: true })

module.exports = mongoose.model("Account", accountSchema)
