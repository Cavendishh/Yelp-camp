const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')

//'extension' fuction is used to add method for Joi to escape HTML to prevent certain cybersecurity attacks
const extension = joi => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        })
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean
      }
    }
  }
})

//Extend original Joi with 'extension' function from above
const Joi = BaseJoi.extend(extension)

//Campground schema created with Joi to help with validations
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    description: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML()
  }).required(),
  deleteImages: Joi.array()
})

//Review schema created with Joi to help with validations
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
})