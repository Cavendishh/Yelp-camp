const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

//Find all campgrounds and render index template
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}

//Render page to make a new campground
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

//Logic to creating new campground - redirect to new campground when done
module.exports.createCampground = async (req, res) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground)
  campground.geometry = geoData.body.features[0].geometry
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename}))
  campground.author = req.user._id
  await campground.save()
  req.flash('success', 'Succesfully made a new campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

//Render and do logic of one campground that was opened
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'author'}})
    .populate('author')
  if (!campground) {
    req.flash('error', 'The campground was not found')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', { campground })
}

//Render campground edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash('error', 'The campground was not found')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground })
}

//Logic to update selected campground - redirect after success
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params
  const { deleteImages } = req.body
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}))
  campground.images.push(...imgs)
  await campground.save()
  if (deleteImages) {
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: deleteImages }}}})
  }
  req.flash('success', 'Succesfully updated the campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

//Logic to delete said campground - Mongoose middleware helps to delete reviews related to it
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash('success', 'Succesfully deleted the campground')
  res.redirect('/campgrounds')
}