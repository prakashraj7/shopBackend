const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const DUMMY_USERS = [
    {
        id: "u1",
        name: "King David",
        email: "david@old.com",
        password: "david123",
    },
]

const getUsers = async (req, res, next) => {
    // res.json({ users: DUMMY_USERS });

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (error) {
        const err = new HttpError(
            'Fetching users failed', 500
        );
        return next(err);
    };

    res.json({ users: users.map(x => x.toObject({ getters: true })) });
};


const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        return next(
            new HttpError('Invalid inputs passed, please checkyour data,', 422)
        )
    };

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Sigining Up failed.', 500);
        return next(error);
    };

    if (existingUser) {
        const error = new HttpError('User exists already, Please login instead.', 422)
        return next(error);
    };

    let hashPassword;
    try {

        hashPassword = await bcrypt.hash(password, 12)
    } catch (error) {
        const err = new HttpError(
            'Could not create user', 500
        );
        return next(err);
    }

    const createdUser = new User({
        name,
        email,
        password: hashPassword,
        image: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    });

    // DUMMY_USERS.push(createdUser);

    try {
        await createdUser.save();

    } catch (err) {
        const error = new HttpError(
            'Signing up  failed', 500
        );
        return next(error);
    };

    let token;

    try {

        token = jwt.sign({ userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share', { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError(
            'Token  failed', 500
        );
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};



const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Logging failed.', 500);
        return next(error);
    };

    if (!existingUser) {
        const error = new HttpError(
            'Invalid Credentials, Could not login', 401
        );
        return next(error);
    };

    let isValidPassword;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (error) {
        const err = new HttpError(
            'Invalid Credentials, Could not login', 500
        );
        return next(err);
    };

    if (!isValidPassword) {
        const err = new HttpError(
            'Invalid Credentials, Could not login', 401
        );
        return next(err);
    };

    try {

        token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share', { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError(
            'Loging failed', 500
        );
        return next(error);
    }

    res.json({ userId: existingUser.id, email: existingUser.email, token: token });

};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;









  // const url = 'mongodb+srv://brum:brum123@cluster0.bbc96ao.mongodb.net/Users?retryWrites=true&w=majority'

    // const client = new MongoClient(url);

    // try {
    //     await client.connect();
    //     const db = client.db();
    //     console.log('Mongo Connected')
    //     const result = await db.collection("User").insertOne(createdUser);
    // } catch (error) {
    //     return res.json({ message: "Siging up failed." });
    // }
    // client.close();