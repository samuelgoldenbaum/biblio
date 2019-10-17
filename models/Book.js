const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

mongoose.Promise = require('bluebird');

let schema = new Schema(
    {
        isbn: {
            type: String,
            minlength: 1,
            maxlength: 36,
            required: true,
            unique: true
        },
        title: {
            type: String,
            minlength: 1,
            maxlength: 36,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'authors',
            required: true
        },
        institution: {
            type: Schema.Types.ObjectId,
            ref: 'institutions',
            required: true
        },
        createdAt: {
            type: Date,
            default: moment().utc()
        },
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

module.exports = mongoose.model('books', schema);
