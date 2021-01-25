const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campground')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError')

//Function to check whether user is logged in - if not return to login page
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You must be signed in')
    return res.redirect('/login')
  }
  next()
}

//Function to check whether user is the author and has the permissions to edit specific campgrounds
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

//Function to check whether user is athe author and has permissions to edit specific reviews
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

//Function to validate campgrounds
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

//Function to validate reviews
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}