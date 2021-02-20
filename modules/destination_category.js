const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var destinationCatSchema = new mongoose.Schema({
    destination_name: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    location: {
        type: String,
        required:true
    },
    destination_description: {
        type: String,
        required:true
    },
    destination_image: {
        type: String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var destinationCatModel =  mongoose.model('Destination Categories',destinationCatSchema);

module.exports = destinationCatModel;