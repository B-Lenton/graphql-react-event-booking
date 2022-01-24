const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");  // exports valid middleware functions; takes incoming requests and funnels them through the GraphQL query parser
const { buildSchema } = require("graphql");  // object destructuring - pull out the buildSchema property from "graphql" (function to define GraphQL schema using template literals)
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/users");

// calls express imported from the express package to create an app object to use to start the node server etc
const app = express();

app.use(bodyParser.json());

// define API endpoint and middleware (pass in javascript object to configure our GraphQL API)
app.use(
    "/graphql",
    graphqlHTTP({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type User {
                _id: ID!
                email: String!
                password: String
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input UserInput {
                email: String!
                password: String!
            }
        
            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        // resolvers for above schema (must have identical names):
        rootValue: {
            events: async () => {
                try {
                    // When not re-saving a queried doc, .lean() avoids mongoose hydrating the doc
                    return await Event.find().lean();
                } catch (err) {
                    throw err;
                }
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                })
                return event
                    .save()
                    .then(result => {
                        console.log(result);
                        return result;
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    });
            },
            createUser: args => {
                const user = new User({
                    // TODO: stopped here at 10:37 part 6
                    email: args.userInput.email,
                    password: args.userInput.password
                })
            }
        },
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
