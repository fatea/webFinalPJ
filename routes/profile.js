var express = require('express');
var router = express.Router({ mergeParams: true});
var auth = require('./lib/auth');

router.get('/', auth.pleaseLogin);

router.get('/', function(req, res, next){
    if(req.params.username == req.session.username){
        res.render('profile');
    }
    else{
        next();
    }
});


module.exports = router;