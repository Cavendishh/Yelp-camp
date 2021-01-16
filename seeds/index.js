const mongoose = require('mongoose')
const cities = require('./cities')
const Campground = require('../models/campground')
const { places, descriptors } = require('./seedHelpers')

const PORT = 3000
const url = 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => {
  console.log('Database connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/483251/1600x900',
      description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium accusantium, veniam omnis non fuga dignissimos eaque tempora ipsam accusamus earum sunt magnam quisquam assumenda incidunt quod perspiciatis fugiat. Incidunt, repellendus!`,
      price
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
  console.log('Database closed')
})