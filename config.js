const path = require('path');
const rootPath = path.join(__dirname, './');
const _ = require('lodash');

module.exports = function config(env) {
    const environments = {
        base: {
            rootPath: rootPath,
            express: {
                secret: 'starwars',
                port: 3000
            },
            db: {
                uri: 'mongodb://localhost',
                database: 'biblio'
            },
            jwt: {
                secret: 'lukeiamyourfather',
                expiresIn: '1d'
            }
        },
        local: {
            mode: 'local',
        },
        development: {
            mode: 'development',
        },
        production: {
            mode: 'production',
        }
    };

    return _.merge(environments.base, environments[env]);
};
