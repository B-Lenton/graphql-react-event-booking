const Booking = require("../../models/booking");
const Event = require("../../models/event");
const { transformBooking, transformEvent, singleEvent } = require("./merge");

module.exports = {
    bookings: async (args, req) => {
        // authentication from is-auth.js middleware
        if (!req.isAuth) {
            throw new Error("Unauthenticated!");
        }
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (err) {
            throw(err);
        }
    },
    bookEvent: async (args, req) => {
        // authentication from is-auth.js middleware
        if (!req.isAuth) {
            throw new Error("Unauthenticated!");
        }
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                user: req.userId,
                event: fetchedEvent
            });
            const result = await booking.save();
            return transformBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args, req) => {
        // authentication from is-auth.js middleware
        if (!req.isAuth) {
            throw new Error("Unauthenticated!");
        }
        // TODO: Check user cancelling === user linked to booking
        try {
            // Configured differently to #8 20:07
            const fetchedBooking = await Booking.findById(args.bookingId);
            const fetchedEvent = singleEvent(fetchedBooking._doc.event);
            await Booking.deleteOne({ _id: args.bookingId })
            return fetchedEvent;
        } catch (err) {
            throw err;
        }
    }

};
