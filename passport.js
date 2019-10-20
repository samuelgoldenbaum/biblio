const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const enums = require('./enums');
const userService = require('./services/userService')();

module.exports = (config, passport) => {
    passport.use('signIn', new LocalStrategy({
        username: 'email',
        password: 'password'
    }, async (email, password, done) => {
        try {
            const result = await userService.authenticate({email: email, password: password});
            if (result.status === enums.status.fail) {
                return done(null, false, {message: result.message});
            }

            return done(null, result.data, {message: 'authenticated'});
        } catch (err) {
            return done(err);
        }
    }));

    passport.use('jwt', new JWTStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.jwt.secret,
        },
        (result, done) => {
            return done(null, result);
        }
    ));
};
