const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var TravelBookingSchema = new mongoose.Schema({
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
    Pickup_Location: {
        type: String,
        required:true
    },
    Droppingoff_Location: {
        type: String,
        required:true
    },
    Pickup_Date: {
        type: Date,
        required:true
    },
    Pickup_Time: {
        type: String,
        required:true
    },
   Dropoff_Date: {
        type: Date,
        required:true
    },
    Dropoff_Time: {
        type: String,
        required:true
    },
    Car_Type: {
        type: String,
        required:true
    },
    Total_Passengers: {
        type: Number,
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

var travelBookModel =  mongoose.model('Travel Booking',TravelBookingSchema);

module.exports = travelBookModel;