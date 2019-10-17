const _ = require('lodash');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const enums = require('./../enums');
const errors = require('./../errors');
const userService = require('./../services/userService')();
const institutionService = require('./../services/institutionService')();

module.exports = (app) => {
    getUsers = async (req, res) => {
        const result = await userService.find({});

        return res.json(result);
    };

    getUser = async (req, res) => {
        const schema = Joi.object({
            id: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
        });

        const validationResult = schema.validate(req.params);
        if (validationResult.error) {
            return {
                status: enums.status.success,
                code: validationResult.error.code,
                message: validationResult.error.message
            };
        }

        const result = await userService.findUser({_id: validationResult.value.id});

        return res.json(result);
    };

    createUser = async (req, res) => {
        const result = await userService.createUser(req.body);

        return res.json(result);
    };

    signIn = async (req, res, next) => {
        passport.authenticate('signIn', async (err, user, info) => {
            try {
                if (err || !user) {
                    return res.sendStatus(401).json({
                        status: enums.status.fail,
                        message: (err !== null) ? err.message : '',
                    });
                }

                req.login(user, {session: false}, async (error) => {
                    if (error) return next(error);

                    return res.json({
                        status: enums.status.success,
                        data: {
                            token: jwt.sign({id: user.id}, app.config.jwt.secret, {expiresIn: app.config.jwt.expiresIn})
                        }
                    });
                });
            } catch (error) {
                return next(error);
            }
        })(req, res, next);
    };

    getBooks = async (req, res, next) => {
        const schema = Joi.object({
            id: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
            iat: Joi.number().required(),
            exp: Joi.number().required()
        });

        const validationResult = schema.validate(req.user);
        if (validationResult.error) {
            return {
                status: enums.status.success,
                code: validationResult.error.code,
                message: validationResult.error.message
            };
        }

        const user = await userService.findUser({_id: validationResult.value.id});
        if (user.status === enums.status.fail || _.isNil(user.data)) {
            return res.json(user);
        }

        const result = await institutionService.findBooks({institution: user.data.institution._id});

        return res.json(result);
    };

    app.route('/books')
        .get(passport.authenticate('jwt', {session: false}), getBooks);

    app.route('/users')
        .get(getUsers)
        .post(createUser);

    app.route('/users/signin')
        .post(signIn);

    app.route('/users/:id')
        .get(getUser);
};
