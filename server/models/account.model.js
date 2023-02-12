const mongoose = require("mongoose")
const defaultPicture = 'default.jpg'

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
  externalLink: {
    type: String,
    maxlength: 64,
  },
  avatar: {
    type: String,
    default: defaultPicture,
  },
  avatar_thumbnail: {
    type: String,
  },
  cover_photo: {
    type: String,
    default: defaultPicture,
  },
}, { timestamps: true })

module.exports = mongoose.model("Account", accountSchema)
