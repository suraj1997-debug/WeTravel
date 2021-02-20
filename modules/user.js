const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    email: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    password: {
        type: String,
        required:true
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var userModel =  mongoose.model('users',userSchema);

module.exports = userModel;