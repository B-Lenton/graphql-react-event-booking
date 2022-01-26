const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./merge");

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(transformEvent);
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
    createEvent: async (args, req) => {
        // authentication from is-auth.js middleware
        if (!req.isAuth) {
            throw new Error("Unauthenticated!");
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;
        try {
            const result = await event.save();
            // store the created event in memory and return its creator (linked user)
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId);
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
};
