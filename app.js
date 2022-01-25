const express = require("express");
const bodyParser = require("body-parser");
const {
    graphqlHTTP
} = require("express-graphql"); // exports valid middleware functions; takes incoming requests and funnels them through the GraphQL query parser
const {
    buildSchema
} = require("graphql"); // object destructuring - pull out the buildSchema property from "graphql" (function to define GraphQL schema using template literals)
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/users");

// calls express imported from the express package to create an app object to use to start the node server etc
const app = express();

app.use(bodyParser.json());

// Can pass below two functions to GraphQL for it to execute:
// const events = eventIds => {
//     return Event.find({_id: { $in: eventIds } })
//         .then(events => {
//             return events.map(event => {
//                 return {
//                     ...event._doc,
//                     _id: event._doc,
//                     creator: user.bind(this, event.creator)
//                 };
//             }); 
//         })
//         .catch(err => {
//             throw err;
//         });
// };

// const user = userId => {
//     return User.findById(user)
//         .then(user => {
//             return {
//                 ...user._doc,
//                 _id: user.id,
//                 createdEvents: events.bind(this, user._doc.createdEvents)
//             };
//         })
//         .catch(err => {
//             throw err;
//         });
// };

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
                creator: User!
            }

            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]
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
                    /**
                     * When not re-saving a queried doc, .lean() avoids mongoose hydrating the doc.
                     * Populate any known relations (e.g. ref keys in models)
                     *  */
                    return await Event.find().lean().populate({
                        // implemented instead of Vid #7 ~11:00
                        // would need to replace below with 13:17 & use events and user functions (near top)
                        path: "creator",
                        populate: {
                            path: "createdEvents",
                            populate: { 
                                path: "creator",
                                populate: { path: "createdEvents" }
                            }
                        }
                    });
                } catch (err) {
                    throw err;
                }
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: "61efc8afd3008daa0f25e4ef"
                });
                let createdEvent;
                return event
                    .save()
                    .then(result => {
                        // store the created event in memory and return its creator (linked user)
                        createdEvent = result;
                        return User.findById("61efc8afd3008daa0f25e4ef");
                    })
                    .then(user => {
                        if (!user) {
                            // no user found edge case
                            throw new Error("User not found.");
                        }
                        user.createdEvents.push(event);
                        return user.save();
                    })
                    .then(result => {
                        return createdEvent.populate({
                            path: "creator"
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    });
            },
            createUser: args => {
                /* User.findOne({ email: args.userInput.email }).then(user => {
                    if (user) {
                        throw new Error("User already exists.");
                    }
                    return brycpt.hash()... move hash line into here
                }) */
                // never store plain text password in DB - create hash password (bcryptjs) - 12 rounds of salting
                return bcrypt
                    .hash(args.userInput.password, 12)
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save()
                    })
                    .then(result => {
                        return { ...result._doc, password: null };
                    })
                    .catch(err => {
                        throw err;
                    });
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