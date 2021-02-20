const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.krtuq.mongodb.net/${process.env.MONGODB_DATABASE}`, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

var conn = mongoose.Collection;

var PackageCatSchema = new mongoose.Schema({
    Package_Type: {
        type: String,
        required:true,
        index: {
            unique:true,
        },
    },
    date:{
        type: Date,
        default: Date.now
    }
});

var PackageCatModel =  mongoose.model('Package Categories',PackageCatSchema);

module.exports = PackageCatModel;