const path = require('path');
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const passport = require('passport');

require('dotenv').config();
const config = require(path.join(__dirname, 'config'))(process.env.MODE);

module.exports = () => {

    initRoutes = (app) => {
        return new Promise((resolve, reject) => {
            app.route('/').get((req, res) => res.send('Biblio'));

            require('./routes/institutionRoutes')(app);
            require('./routes/userRoutes')(app);

            return resolve(app);
        });
    };

    start = () => {
        return new Promise((resolve, reject) => {
            mongoose.connect(`${config.db.uri}/${config.db.database}`, {useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false});
            const db = mongoose.connection;

            db.on('error', (err) => {
                console.error(err);

                return reject(err);
            });

            db.once('open', () => {
                const app = express();

                app.config = config;
                app.db = db;

                app.use(morgan('tiny'));
                app.use(bodyParser.urlencoded({extended: false}));
                app.use(bodyParser.json());
                app.use(session({secret: config.express.secret, resave: true, saveUninitialized: true}));
                app.use(passport.initialize());
                app.use(passport.session());

                require('./passport')(config, passport);

                initRoutes(app)
                    .then(() => {
                        app.listen(config.express.port, () => {
                            console.log(`Open http://localhost:${config.express.port} to see a response.`)
                        });

                        return resolve(app);
                    })
                    .catch((err => {
                        console.error(err);
                    }));
            });
        });
    };

    return {
        start: start
    }
};
