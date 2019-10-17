const _ = require('lodash');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const enums = require('./../enums');
const errors = require('./../errors');
const User = require('../models/user');
const institutionService = require('./../services/institutionService')();

module.exports = () => {
    createUser = async (params) => {
        const schema = Joi.object({
            name: Joi.string().min(1).max(36).required(),
            email: Joi.string().email().required(),
            role: Joi.string().valid('student', 'academic', 'administrator').required(),
            password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32})/).required().error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.empty":
                            err.message = "Value should not be empty!";
                            break;
                        case "string.pattern.base":
                            err.message = `Value too weak, needs 1 lowercase, 1 uppercase, 1 number, 1 special character and between 8-32`;
                            break;
                        default:
                            break;
                    }
                });
                return errors;
            }),
            createdAt: Joi.date().optional()
        });

        const validationResult = schema.validate(params);
        if (validationResult.error) {
            return {
                status: enums.status.fail,
                code: errors.validationError.code,
                message: validationResult.error.message
            };
        }

        try {
            validationResult.value.password = await bcrypt.hash(validationResult.value.password, 10);

            const domain = validationResult.value.email.substring(validationResult.value.email.indexOf('@') + 1);

            const institution = await institutionService.findInstitution({domain: domain});
            if (institution.status === enums.status.fail || _.isNil(institution.data)) {
                if(institution.status === enums.status.fail) {
                    return institution;
                }

                return {
                    status: enums.status.fail,
                    code: errors.institutionNotFound.code,
                    message: errors.institutionNotFound.message
                };
            }

            validationResult.value.institution = institution.data._id;
            const saved = await User.create(validationResult.value);
            return {
                status: enums.status.success,
                data: saved
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    findUser = async (params) => {
        try {
            const user = await User.findOne(params).populate('institution');
            return {
                status: enums.status.success,
                data: user
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    findUsers = async (params) => {
        try {
            const users = await User.find(params);
            return {
                status: enums.status.success,
                data: users
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    authenticate = async (params) => {
        try {
            const user = await User.findOne({email: params.email}, {_id: 1, password: 1, role: 1});
            if (!user) {
                return {
                    status: enums.status.fail,
                    message: 'user not found'
                };
            }

            const isValid = await bcrypt.compare(params.password, user.password);
            if (!isValid) {
                return {
                    status: enums.status.fail,
                    message: 'invalid password'
                };
            }

            delete user.password;

            return {
                status: enums.status.success,
                data: user
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    return {
        createUser: createUser,
        findUser: findUser,
        findUsers: findUsers,

        authenticate: authenticate
    }
};
