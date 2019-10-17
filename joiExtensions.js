const ISBN = require('isbn-verify');

module.exports = (joi) => {
    isISBN = {
        type: 'string',
        base: joi.string(),
        language: {
            isISBN: 'must be a valid ISBN {{isISBN}}'
        },
        rules: [{
            name: 'isISBN',
            params: {
                isISBN: joi.func().ref().required()
            },
            validate(params, value, state, options) {
                if (!ISBN.Verify(value)) {
                    return this.createError('string.isISBN', {value}, state, options);
                }
                return value
            }
        }]
    };

    return {
        isISBN: isISBN
    }
};
