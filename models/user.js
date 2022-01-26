const mongoose = require("mongoose");
require("mongoose-type-email");

mongoose.SchemaTypes.Email.defaults.message = "Email address is invalid";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: mongoose.SchemaTypes.Email,
        correctTld: true,
        unique: "This email is already registered",
        index: true,
        uniqueCaseInsensitive: true,
        // validate: {
        //     validator: v => validEmail(v),
        //     message: "{VALUE} is not a valid email"
        // },
        required: [true, "Email required"],
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: "Event"
        }
    ]
});

module.exports = mongoose.model("User", userSchema)
