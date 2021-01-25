const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

//Create an User mongoose schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
})

//Add methods to user schema from 'passport-local-mongoose' package
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)