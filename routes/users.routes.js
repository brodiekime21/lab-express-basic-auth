var express = require('express');
var router = express.Router();

const bcryptjs = require('bcryptjs');
const saltRounds = 10;


const User = require('../models/User.model')

/* GET users listing. */
router.get('/signup', (req, res, next) => {
  res.render('auth/signup.hbs');
});

router.post('/signup', (req,res,next)=>{
  console.log('The form data: ', req.body);

  const { username, password } = req.body;
 
  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      return User.create({
        // username: username
        username,
        // passwordHash => this is the key from the User model
        //     ^
        //     |            |--> this is placeholder (how we named returning value from the previous method (.hash()))
        passwordHash: hashedPassword
      });
    })
    .then((userFromDB) => {
      console.log('Newly created user is: ', userFromDB);
      res.send("Created User")
    })
    .catch(error => next(error));

  // res.redirect("/users/profile")
})


router.get('/login', (req,res,next) => {
  res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
 
  if (!username || !password) {
    res.render('auth/login.hbs', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
 
  User.findOne({ 
    username: req.body.username //broken out to explain could leave in one line and remove req.~~~~
  })
    .then(user => {
      if (!user) {
        res.render('auth/login.hbs', { errorMessage: 'Email is not registered. Try with other email.' });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.user = user
        console.log('SESSION =====> ', req.session);
        res.send('session on');
      } else {
        res.render('auth/login.hbs', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

module.exports = router;
