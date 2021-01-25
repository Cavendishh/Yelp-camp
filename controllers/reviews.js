const Campground = require('../models/campground')
const Review = require('../models/review')

//Logic to create a review to specific campground
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  const review = new Review(req.body.review)
  review.author = req.user._id
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  req.flash('success', 'Created a new review')
  res.redirect(`/campgrounds/${campground._id}`)
}

//Logic to delete a review to specific campground
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params
  Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'Succesfully deleted the review')
  res.redirect(`/campgrounds/${id}`)
}