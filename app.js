const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql"); // exports valid middleware functions; takes incoming requests and funnels them through the GraphQL query parser
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth")

// calls express imported from the express package to create an app object to use to start the node server etc
const app = express();

app.use(bodyParser.json());

app.use(isAuth);

// define API endpoint and middleware (pass in javascript object to configure our GraphQL API)
app.use(
    "/graphql",
    graphqlHTTP({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true
    })
);

// connecting app to database (using Mongoose and MongoDB Atlas)
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ppjrt.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });