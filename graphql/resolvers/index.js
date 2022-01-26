const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingResolver = require("./booking");

const rootResolver = {
    // spread every resolver function from the separate resolver files
    ...authResolver,
    ...eventsResolver,
    ...bookingResolver
};

module.exports = rootResolver;
