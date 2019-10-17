const async = require('async');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const moment = require('moment');
const bcrypt = require('bcrypt');
const errors = require('./../errors');
const enums = require('./../enums');
const institutionData = require('./data/institutions');
const userData = require('./data/users');
const bookData = require('./data/books');
const authorData = require('./data/authors');

chai.use(chaiHttp);

const app = require('../app')();

let server = null;

describe('Biblio tests', () => {

    before((done) => {
        app.start()
            .then(result => {
                server = result;

                done();
            })
            .catch(error => {
                done(error);
            });
    });

    beforeEach((done) => {
        server.db.db.dropDatabase((err) => {
            if (err) {
                return done(err);
            }

            done();
        });
    });

    it('should not allow unauthenticated access to secured routes', (done) => {
        async.waterfall([
            (callback) => {
                chai.request(server)
                    .get('/books')
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(401);

                        callback(null);
                    });
            }
        ], (err) => {
            if (err) {
                console.error(err);
                return done(err);
            }

            done();
        });
    });

    it('should authenticate a user', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let user = userData[0];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);

                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution.should.eq(institution._id);

                        bcrypt.compare(user.password, result.body.data.password, (err, res) => {
                            res.should.be.true;

                            callback(null, institution, user, result.body.data);
                        });
                    });
            },
            (institution, user, savedUser, callback) => {
                chai.request(server)
                    .post('/users/signin')
                    .send({username: user.email, password: user.password})
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.token.should.be.a('string').and.not.be.empty;

                        callback(null, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });

    it('should create an institution', (done) => {
        let institution = institutionData[0];
        institution.createdAt = moment().utc();

        chai.request(server)
            .post('/institutions')
            .send(institution)
            .end((err, result) => {
                if (err) {
                    return done(err);
                }

                result.should.have.status(200);
                result.body.status.should.eq(enums.status.success);

                result.body.data._id.should.be.a('string');
                result.body.data.name.should.eq(institution.name);
                result.body.data.domain.should.eq(institution.domain);
                result.body.data.url.should.eq(institution.url);

                done();
            });
    });

    it('should get institutions', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                chai.request(server)
                    .get('/institutions')
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.should.be.an('array').that.is.not.empty;

                        callback(null, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });

    it('should create a user', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let user = userData[0];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);

                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution.should.eq(institution._id);

                        bcrypt.compare(user.password, result.body.data.password, (err, res) => {
                            res.should.be.true;

                            callback(null, institution, result.body.data);
                        });
                    });
            },
            (institution, user, callback) => {
                chai.request(server)
                    .get(`/users/${user._id}`)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.eq(user._id);
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);
                        result.body.data.password.should.eq(user.password);
                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution._id.should.eq(institution._id);

                        callback(null, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });

    it('should not create a user if no institution is found', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let user = userData[1];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.fail);

                        result.body.code.should.eq(errors.institutionNotFound.code);
                        result.body.message.should.eq(errors.institutionNotFound.message);

                        callback(null);
                    });
            }
        ], (err) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            done();
        });
    });

    it('should authenticate a user', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let user = userData[0];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);

                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution.should.eq(institution._id);

                        bcrypt.compare(user.password, result.body.data.password, (err, res) => {
                            res.should.be.true;

                            callback(null, institution, user, result.body.data);
                        });
                    });
            },
            (institution, user, savedUser, callback) => {
                chai.request(server)
                    .post('/users/signin')
                    .send({username: user.email, password: user.password})
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.token.should.be.a('string').and.not.be.empty;

                        callback(null, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });

    it('should create a book', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let author = authorData[0];
                author.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions/authors')
                    .send(author)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(author.name);
                        result.body.data.createdAt.should.eq(author.createdAt.toISOString());

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, author, callback) => {
                let book = bookData[0];
                book.institution = institution._id;
                book.author = author._id;
                book.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions/books')
                    .send(book)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.isbn.should.eq(book.isbn);
                        result.body.data.title.should.eq(book.title);
                        result.body.data.author.should.eq(book.author);
                        result.body.data.institution.should.eq(institution._id);
                        result.body.data.createdAt.should.eq(book.createdAt.toISOString());

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, book, callback) => {
                chai.request(server)
                    .get(`/institutions/books/${book._id}`)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.isbn.should.eq(book.isbn);
                        result.body.data.title.should.eq(book.title);
                        result.body.data.author._id.should.eq(book.author);
                        result.body.data.institution._id.should.eq(book.institution);
                        result.body.data.createdAt.should.eq(book.createdAt);

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, book, callback) => {
                let user = userData[0];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);
                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution.should.eq(institution._id);

                        bcrypt.compare(user.password, result.body.data.password, (err, res) => {
                            res.should.be.true;

                            callback(null, institution, book, result.body.data);
                        });
                    });
            },
            (institution, book, user, callback) => {
                chai.request(server)
                    .get(`/institutions/${institution._id}/books`)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.should.have.lengthOf(1);

                        const saved = result.body.data[0];

                        saved._id.should.be.a('string');
                        saved.isbn.should.eq(book.isbn);
                        saved.title.should.eq(book.title);
                        saved.author.should.eq(book.author._id);
                        saved.institution.should.eq(book.institution._id);
                        saved.createdAt.should.eq(book.createdAt);

                        callback(null, institution, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });

    it('should get books for a user', (done) => {
        async.waterfall([
            (callback) => {
                let institution = institutionData[0];
                institution.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions')
                    .send(institution)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(institution.name);
                        result.body.data.domain.should.eq(institution.domain);
                        result.body.data.url.should.eq(institution.url);

                        callback(null, result.body.data);
                    });
            },
            (institution, callback) => {
                let author = authorData[0];
                author.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions/authors')
                    .send(author)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(author.name);
                        result.body.data.createdAt.should.eq(author.createdAt.toISOString());

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, author, callback) => {
                let book = bookData[0];
                book.institution = institution._id;
                book.author = author._id;
                book.createdAt = moment().utc();

                chai.request(server)
                    .post('/institutions/books')
                    .send(book)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.isbn.should.eq(book.isbn);
                        result.body.data.title.should.eq(book.title);
                        result.body.data.author.should.eq(book.author);
                        result.body.data.institution.should.eq(institution._id);
                        result.body.data.createdAt.should.eq(book.createdAt.toISOString());

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, book, callback) => {
                chai.request(server)
                    .get(`/institutions/books/${book._id}`)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.isbn.should.eq(book.isbn);
                        result.body.data.title.should.eq(book.title);
                        result.body.data.author._id.should.eq(book.author);
                        result.body.data.institution._id.should.eq(book.institution);
                        result.body.data.createdAt.should.eq(book.createdAt);

                        callback(null, institution, result.body.data);
                    });
            },
            (institution, book, callback) => {
                let user = userData[0];
                user.createdAt = moment().utc();

                chai.request(server)
                    .post('/users')
                    .send(user)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data._id.should.be.a('string');
                        result.body.data.name.should.eq(user.name);
                        result.body.data.email.should.eq(user.email);
                        result.body.data.role.should.eq(user.role);
                        result.body.data.institution.should.eq(institution._id);

                        bcrypt.compare(user.password, result.body.data.password, (err, res) => {
                            res.should.be.true;

                            callback(null, institution, book, user, result.body.data);
                        });
                    });
            },
            (institution, book, user, savedUser, callback) => {
                chai.request(server)
                    .post('/users/signin')
                    .send({username: user.email, password: user.password})
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.token.should.be.a('string').and.not.be.empty;

                        callback(null, institution, book, savedUser, result.body.data);
                    });
            },
            (institution, book, savedUser, token, callback) => {
                chai.request(server)
                    .get(`/books`)
                    .set('Authorization', `Bearer ${token.token}`)
                    .end((err, result) => {
                        if (err) {
                            return callback(err);
                        }

                        result.should.have.status(200);
                        result.body.status.should.eq(enums.status.success);

                        result.body.data.should.have.lengthOf(1);

                        const saved = result.body.data[0];

                        saved._id.should.be.a('string');
                        saved.isbn.should.eq(book.isbn);
                        saved.title.should.eq(book.title);
                        saved.author.should.eq(book.author._id);
                        saved.institution.should.eq(book.institution._id);
                        saved.createdAt.should.eq(book.createdAt);

                        callback(null, result.body.data);
                    });
            }
        ], (err, result) => {
            if (err) {
                console.error(err);

                return done(err);
            }

            console.info(JSON.stringify(result));

            done();
        });
    });
});
