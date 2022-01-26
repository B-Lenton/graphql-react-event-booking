const jwt = require("jsonwebtoken");

/**
  * Valid express.js middleware function profile.
  * Passed as a function reference in app.js to run on every incoming request.
  * Checking authorization of users.
  * Never throws an error, only adds metadata to the request.
 */
module.exports = (req, res, next) => {
    // check if there is an auth field in incoming requests
    const authHeader = req.get("Authorization")
    if (!authHeader) {
        // No auth field --> new field on req for resolvers to check 
        req.isAuth = false;
        return next();
    }
    // Authorization: Bearer <tokenvalue>
    // ignored left : [0] split [1]
    const token = authHeader.split(" ")[1];
    if (!token || token === "") {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        // attempt to verify the token
        decodedToken = jwt.verify(token, "somesupersecretkey");
    } catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    return next();
}
