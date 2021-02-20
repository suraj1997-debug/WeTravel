const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});


var conn = mongoose.Collection;

var BookingSchema = new mongoose.Schema({
    Name: {
        type: String,
        required:true,
    },
    Number: {
        type: Number,
        required:true
    },
    Email: {
        type: String,
        required:true
    },
    Location: {
        type: String,
        required:true
    },
    Package_Type: {
        type: String,
        required:true
    },
    Price: {
        type: Number,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var BookingModel =  mongoose.model('Booking',BookingSchema);

module.exports = BookingModel;