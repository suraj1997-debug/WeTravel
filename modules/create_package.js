const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});


var conn = mongoose.Collection;

var CreatePackageSchema = new mongoose.Schema({
    Package_name: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    Package_Type: {
        type: String,
        required:true
    },
    Package_location: {
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
    Package_features: {
        type: String,
        required:true
    },
    Package_Details: {
        type: String,
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

var CreatePackageModel =  mongoose.model('Packages',CreatePackageSchema);

module.exports = CreatePackageModel;