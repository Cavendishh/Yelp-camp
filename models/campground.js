const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema
const opts = { toJSON: { virtuals: true }}

const ImageSchema = new Schema({
  url: String,
  filename: String
})

//Mongoose virtual to crop and control image size
ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200/ar_4:3,c_fill/')
})

//Mongoose virtual to crop and control image size
ImageSchema.virtual('thumbnailIndexPage').get(function() {
  return this.url.replace('/upload', '/upload/w_600/ar_4:3,c_fill/')
})

//Mongoose virtual to compress image quality automatically up to 85%
ImageSchema.virtual('compress').get(function() {
  return this.url.replace('/upload', '/upload/q_auto')
})

//Mongoose virtual to crop all images to same size
ImageSchema.virtual('aspectRatio').get(function() {
  return this.url.replace('/upload', '/upload/ar_4:3,c_fill/')
})

//Mongoose campground schema
const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  images: [ImageSchema],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, opts)

//Mongoose virtual to bring certain property key and value through EJS to Javascript file
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
    <strong class='popUpTitle'>
      <a href='/campgrounds/${this._id}'>${this.title}</a>
    </strong>
  `
})

//Mongoose middleware to help remove every review from database that has been deleted with said campground
CampgroundSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await Review.remove({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model('Campground', CampgroundSchema)