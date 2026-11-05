const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');

const app = express.Router();

const checkCredentialsWithDatabase = (username, password) => {
    const configuredUsername = config.get('auth.username');
    const configuredPassword = config.get('auth.password');

    return Boolean(configuredUsername) &&
        Boolean(configuredPassword) &&
        username === configuredUsername &&
        password === configuredPassword;
};

app.post('/', (request, response) => {
    const isCredentialsValid = checkCredentialsWithDatabase(
        request.body.username,
        request.body.password
    );

    if (isCredentialsValid) {
        const secretKey = config.get('jwt.secretKey');
        const payload = {
            username: request.body.username,
            isUserLoggedIn: true,
            whenUserLoggedIn: new Date(),
            browserDetails: request.headers['user-agent'],
            role: 'here_goes_role_received_from_database',
        };

        const token = jwt.sign(payload, secretKey);
        response.send({ jwt: token });
    } else {
        response.send({ Message: 'Invalid Credentials' });
    }
});

module.exports = app;
