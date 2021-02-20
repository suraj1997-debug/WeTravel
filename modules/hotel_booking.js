const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});


var conn = mongoose.Collection;

var BookingHotelSchema = new mongoose.Schema({
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
    Hotel_Name: {
        type: String,
        required:true
    },
    Discount: {
         type: Number,
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

var BookingHotelModel =  mongoose.model('Hotel Booking',BookingHotelSchema);

module.exports = BookingHotelModel;