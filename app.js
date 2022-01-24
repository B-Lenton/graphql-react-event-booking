const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");  // exports valid middleware functions; takes incoming requests and funnels them through the GraphQL query parser
const { buildSchema } = require("graphql");  // object destructuring - pull out the buildSchema property from "graphql" (function to define GraphQL schema using template literals)

// calls express imported from the express package to create an app object to use to start the node server etc
const app = express();

const events = [];

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

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }
        
            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        // resolvers for above schema (must have identical names):
        rootValue: {
            events: () => {
                return events;
            },
            createEvent: (args) => {
                const event = {
                    _id: Math.random().toString(),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: args.eventInput.date
                };
                events.push(event);
                return event;
            }
        },
        graphiql: true
    })
);

app.listen(3000);