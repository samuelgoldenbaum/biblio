const Joi = require('@hapi/joi');

const enums = require('./../enums');
const errors = require('./../errors');
const institutionService = require('./../services/institutionService')();

module.exports = (app) => {
    getInstitutions = async (req, res) => {
        const result = await institutionService.findInstitutions({});

        return res.json(result);
    };

    getInstitution = async (req, res) => {
        const schema = Joi.object({
            id: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
        });

        const validationResult = schema.validate(req.params);
        if (validationResult.error) {
            return {
                status: enums.status.success,
                code: errors.validationError.code,
                message: validationResult.error.message
            };
        }

        const result = await institutionService.findInstitution({_id: validationResult.value.id});

        return res.json(result);
    };

    createInstitution = async (req, res) => {
        const result = await institutionService.createInstitution(req.body);

        return res.json(result);
    };

    createBook = async (req, res) => {
        const result = await institutionService.createBook(req.body);

        return res.json(result);
    };

    findBooksForInstitution = async (req, res) => {
        const schema = Joi.object({
            id: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
        });

        const validationResult = schema.validate(req.params);
        if (validationResult.error) {
            return {
                status: enums.status.success,
                code: errors.validationError.code,
                message: validationResult.error.message
            };
        }

        const result = await institutionService.findBooks({institution: validationResult.value.id});

        return res.json(result);
    };

    findBook = async (req, res) => {
        const schema = Joi.object({
            id: Joi.string().pattern(/^[a-zA-Z0-9]{24,24}$/).required(),
        });

        const validationResult = schema.validate(req.params);
        if (validationResult.error) {
            return {
                status: enums.status.success,
                code: errors.validationError.code,
                message: validationResult.error.message
            };
        }

        const result = await institutionService.findBook({_id: validationResult.value.id});

        return res.json(result);
    };

    createAuthor = async (req, res) => {
        const result = await institutionService.createAuthor(req.body);

        return res.json(result);
    };

    app.route('/institutions')
        .get(getInstitutions)
        .post(createInstitution);

    app.route('/institutions/authors')
        .post(createAuthor);

    app.route('/institutions/books')
        .post(createBook);

    app.route('/institutions/:id/books')
        .get(findBooksForInstitution);

    app.route('/institutions/books/:id')
        .get(findBook);

    app.route('/institutions/:id')
        .get(getInstitution);
};
