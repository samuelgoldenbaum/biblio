const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

mongoose.Promise = require('bluebird');

let schema = new Schema(
    {
        name: {
            type: String,
            minlength: 1,
            maxlength: 36,
            required: true
        },
        createdAt: {
            type: Date,
            default: moment().utc()
        }
    },
    {
        versionKey: false
    }
);

// automatically set createdAt using server utc
schema.pre('save', next => {
    if (!this.createdAt) {
        this.createdAt = moment().utc();
    }

    next();
});

module.exports = mongoose.model('authors', schema);
