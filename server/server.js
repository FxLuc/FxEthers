const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')

if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: '.env.production' });
} else if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: '.env.development' });
} else {
  require("dotenv").config();
}

// mongoose connect
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(error => console.log(error))

const whitelistOrigin = ['https://fxethers.com', 'http://127.0.0.1']

app.use(cors({ origin: whitelistOrigin }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// router
require('./routes/index')(app)
app.use(express.static('public'))
// app.use('metadata/pictures/file', express.static('public/pictures/items'))
// app.use('account/avatars', express.static('public/pictures/avatars'))

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.status(404).json('404 Not found')
})

const PORT = (process.env.PORT || 4000)
app.listen(PORT, () => {
  console.log('Server is running on Port:', PORT)
})
