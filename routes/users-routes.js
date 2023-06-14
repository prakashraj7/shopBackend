
const express = require('express');
const { check } = require('express-validator');
const { validationResult } = require('express-validator');


const router = express.Router();


const usersControllers = require('../controllers/user-controllers');

router.get('/', usersControllers.getUsers);
router.post('/signup', [
    check('name')
        .not()
        .isEmpty(),
    check('email').normalizeEmail()
        .isEmail(),
    check('password').isLength({ min: 6 })
], usersControllers.signUp);
router.post('/login', usersControllers.login);


module.exports = router;