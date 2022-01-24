/**
 * A JavaScript model created with the mongoose package, which uses models to manager data (easier to implement a model controller endpoint)
 */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;  // schema property (points at a constructor function - used to generate new schema objects)

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});
//                          (model name, schema to be used) 
module.exports = mongoose.model("Event", eventSchema)
