const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var PackagedestSchema = new mongoose.Schema({
    Package_name: {
        type: String,
        required:true,
       
    },
    Package_location: {
        type: String,
        required:true
    },
    Description: {
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

var PackagedestModel =  mongoose.model('Package related Destinations',PackagedestSchema);

module.exports = PackagedestModel;