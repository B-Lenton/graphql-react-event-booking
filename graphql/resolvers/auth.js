const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

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
    },
    login: async ({ email, password }) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                // TODO: Error --> "Invalid login credentials" (after debugging)
                throw new Error("User does not exist!");
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                // TODO: Error --> "Invalid login credentials" (after debugging)
                throw new Error("Password is incorrect!")
            }
            // can use jwt to store some optional data (first arg), then a string for hashing to compare, then an optional expiration time
            const token = jwt.sign({ userId: user.id, email: user.email }, "somesupersecretkey", { expiresIn: "1h" });
            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            };
        } catch (err) {
            throw err;
        }
    }
};
