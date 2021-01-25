if (process.env.NODE_ENV !== 'production') require('dotenv').config()

//Imported packages and files
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const User = require('./models/user')
const ExpressError = require('./utils/ExpressError')
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require('./public/javascripts/helmetUrls')
const PORT = 3000

const app = express()

//Imported routes
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const url = 'mongodb://localhost:27017/yelp-camp'

//Connecting to mongoose
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

//Setting up engine, path routes, new method and sanitizing mango to protect from basic mongoose injection attacks
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

//Configuring session cookies
const sessionConfig = {
  name: 'session',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

//Helmet is a package for cyber security purposes to defend from possible attacks
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

//Configurating helmet's content security policy
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dgntv9bgo/",
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
)

//Passport package used for authentication
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Middleware to save variables for later use on ejs templates
app.use((req, res, next) => {
  res.locals.currentUrl = req._parsedOriginalUrl.path
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

//Defining routes
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes )

//Renders homepage
app.get('/', (req, res) => {
  res.render('home')
})

//Every page that is not found is answered with '404 error code and a preset message
app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
})

//In case of mysterious error - answer with statuscode 500 if status code not defined. 
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if(!err.message) err.message = 'Something went wrong'
  res.status(statusCode).render('error', { err })
})

//Start the server using express
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`)
})