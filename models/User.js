const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const enums = require('./../enums');

mongoose.Promise = require('bluebird');

let schema = new Schema(
    {
        name: {
            type: String,
            minlength: 1,
            maxlength: 36,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: enums.roles,
            required: true
        },
        password: {
            type: String,
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

module.exports = mongoose.model('users', schema);
