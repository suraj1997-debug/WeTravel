const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});


var conn = mongoose.Collection;

var ContactSchema = new mongoose.Schema({
    Full_Name: {
        type: String,
        required:true,
    },
    Email: {
        type: String,
        required:true
    },
    Message: {
        type: String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var ContactModel =  mongoose.model('Enquiry',ContactSchema);

module.exports = ContactModel;