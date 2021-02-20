const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var CreateHotelSchema = new mongoose.Schema({
    Package_name: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    Package_location: {
        type: String,
        required:true
    },
    Package_address: {
        type: String,
        required:true
    },
    Package_Duration: {
        type: Number,
        required:true
    },
    Package_Price: {
        type: Number,
        required:true
    },
    Package_Description: {
        type: String,
        required:true
    },
    Tickets_available: {
        type: Number,
        required:true
    },
    Ratings: {
        type: Number,
        required:true
    },
    Discount: {
        type: Number,
        required:true
    },
   Package_image: {
        type: String,
        required:true
    },
    Package_map: {
        type: String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var CreateHotelModel =  mongoose.model('Hotel Packages',CreateHotelSchema);

module.exports = CreateHotelModel;