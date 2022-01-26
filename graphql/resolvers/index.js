const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

// Pass below two functions to GraphQL for it to execute:
const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
    } catch (err) {
        throw err;
    }
};

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            }); 
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
/**
 * For events: When not re-saving a queried doc, .lean() avoids mongoose hydrating the doc.
 * Populate any known relations (e.g. ref keys in models)
 * This worked except for returning a correct ISOString date
 return await Event.find().lean().populate({
     path: "creator",
        populate: {
            path: "createdEvents",
            populate: { 
                path: "creator",
                populate: { path: "createdEvents" }
            }
        }
    })
    *  */

    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        } catch (err) {
            throw(err);
        }
    },
    /**
     * bookings: async () => {

        try {

            const bookings = await Booking.find()

                .populate('user')

                .populate('event');

            return bookings;

        } catch (err) {

            throw err;

        }

    },

     * easier way to retrieve data about user & booked event than above?
     */

    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "61f117d2c426f9eae7e9d7af"
        });
        let createdEvent;
        try {
            const result = await event.save();
            // store the created event in memory and return its creator (linked user)
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById("61f117d2c426f9eae7e9d7af");
            if (!creator) {
                // no user found edge case
                throw new Error("User not found.");
            }
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    createUser: async args => {
        try {
            // never store plain text password in DB - create hash password (bcryptjs) - 12 rounds of salting
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, _id: result.id, password: null };
        } catch (err) {
            throw(err);
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                user: "61f117d2c426f9eae7e9d7af",
                event: fetchedEvent
            });
            const result = await booking.save();
            return {
                ...result._doc,
                _id: result.id,
                user: user.bind(this, booking._doc.user),
                event: singleEvent.bind(this, booking._doc.event),
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            };
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async args => {
        try {
            // Configured differently to #8 20:07
            const fetchedBooking = await Booking.findById(args.bookingId);
            const fetchedEvent = await singleEvent(fetchedBooking._doc.event);
            await Booking.deleteOne({ _id: args.bookingId })
            return fetchedEvent;
        } catch (err) {
            throw err;
        }
    }

    /**
     * bookEvent: async args => {

        try {

            const user = '5db1ff0c7e34b12218cc8a32';

            const event = args.eventId;

            const newBooking = await new Booking({

                event,

                user,

            });

            return await newBooking.save();

        } catch (err) {

            throw err;

        }

    },
     * better way to book event?
     */
};


/**
 * In "cancelBooking,: async args => {}" why don't we just use the singleEvent function and return it, just like this
const fetchedEvent = singleEvent(fetchedBooking._doc.event);
return fetchedEvent;
 */