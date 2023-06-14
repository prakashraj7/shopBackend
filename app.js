const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})


// app.use("/api/places", placeRoutes);
app.use('/api/users', userRoutes);

app.use((req, rea, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
})


app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next();
    };
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occured.' })
});


mongoose
    .connect('mongodb+srv://brum:brum123@cluster0.bbc96ao.mongodb.net/mern?retryWrites=true&w=majority')
    .then(() => {
        app.listen(5000);
        console.log('Mongo connected')
    })
    .catch(err => {
        console.log(err);
    });
