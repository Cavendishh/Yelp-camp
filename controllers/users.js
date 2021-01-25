const User = require('../models/user')

//Render register page
module.exports.renderRegister = (req, res) => {
  res.render('users/register')
}

//Try to create an user with values in req.body - if error catch it
module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body
    const user = new User({ email, username })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, err => {
      if (err) return next(err)
      req.flash('Welcome to Yelp Camp!')
      res.redirect('/campgrounds')
    })
    
  } catch(e) {
    req.flash('error', e.message)
    res.redirect('/register')
  }
}

//Render login page
module.exports.renderLogin = (req, res) => {
  res.render('users/login')
}

//Login logic to let user log in, reditected back where he came from originally and
//then deleting session cookie because it isnt relevant anymore
module.exports.login =  (req,res) => {
  req.flash('success', 'Welcome back user!')
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
}

//Logout logic
module.exports.logout = (req, res) => {
  req.logout()
  req.flash('success', 'Good bye!')
  res.redirect('/campgrounds')
}

