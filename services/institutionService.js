const BaseJoi = require('@hapi/joi');
const ISBN = require('isbn-verify');

const Joi = BaseJoi.extend((joi) => {
    return {
        type: 'isISBN',
        base: joi.string(),
        messages: {
            'isISBN.base': '"{{#label}}" must be a valid ISBN',
        },
        validate(value, helpers) {
            if (!ISBN.Verify(value)) {
                return {value, errors: helpers.error('isISBN.base')};
            }
        },
    };
});

const enums = require('./../enums');
const errors = require('./../errors');
const Institution = require('../models/institution');
const Book = require('../models/book');
const Author = require('../models/author');

module.exports = () => {
    findInstitution = async (params) => {
        try {
            const institution = await Institution.findOne(params).populate('institution');
            return {
                status: enums.status.success,
                data: institution
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    findInstitutions = async (params) => {
        try {
            const institutions = await Institution.find(params);
            return {
                status: enums.status.success,
                data: institutions
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    createInstitution = async (params) => {
        const schema = Joi.object({
            name: Joi.string().min(1).max(36).required(),
            url: Joi.string().uri().required(),
            domain: Joi.string().domain().required(),
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
            const saved = await Institution.create(params);
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

    createBook = async (params) => {
        const schema = Joi.object({
            institution: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
            isbn: Joi.isISBN().required(),
            title: Joi.string().min(1).max(36).required(),
            author: Joi.string().min(1).max(36).required(),
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
            const saved = await Book.create(params);
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

    findBook = async (params) => {
        try {
            const book = await Book.findOne(params).populate('institution').populate('author');
            return {
                status: enums.status.success,
                data: book
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    findBooks = async (params) => {
        try {
            const books = await Book.find(params);
            return {
                status: enums.status.success,
                data: books
            };
        } catch (err) {
            return {
                status: enums.status.fail,
                message: err.message
            };
        }
    };

    createAuthor = async (params) => {
        const schema = Joi.object({
            name: Joi.string().min(1).max(36).required(),
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
            const saved = await Author.create(params);
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

    return {
        createInstitution: createInstitution,
        findInstitution: findInstitution,
        findInstitutions: findInstitutions,

        createBook: createBook,
        findBook: findBook,
        findBooks: findBooks,

        createAuthor: createAuthor
    }
};
