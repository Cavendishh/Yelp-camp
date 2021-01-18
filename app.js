const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')

const campgrounds = require('./routes/campground')
const reviews = require('./routes/reviews')

const PORT = 3000
const url = 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => {
  console.log('Database connected')
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))


app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews )

app.get('/', (req, res) => {
  res.render('home')
})

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if(!err.message) err.message = 'Something went wrong'
  res.status(statusCode).render('error', { err })
})

app.listen(PORT, () => {
    console.log('Serving on port 3000')
})