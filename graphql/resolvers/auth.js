const bcrypt = require("bcryptjs");

const User = require("../../models/user");


// GraphQL allows us to pass functions to it for execution:

module.exports = {
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
    }
};
