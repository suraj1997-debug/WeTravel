const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var FlightBookingSchema = new mongoose.Schema({
    Name: {
        type: String,
        required:true,
    },
    Phone: {
        type: Number,
        required:true
    },
    Email: {
        type: String,
        required:true
    },
    Flying_From: {
        type: String,
        required:true
    },
    Flying_To: {
        type: String,
        required:true
    },
    Arrival_Date: {
        type: Date,
        required:true
    },
    Departure_Date: {
        type: Date,
        required:true
    },
    No_of_Adults: {
        type: Number,
        required:true
    },
    No_of_Children: {
        type: Number,
        required:true
    },
    Min_Price: {
        type: Number,
        required:true
    },
    Max_Price: {
        type: Number,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var flightBookModel =  mongoose.model('Flight Booking',FlightBookingSchema);

module.exports = flightBookModel;