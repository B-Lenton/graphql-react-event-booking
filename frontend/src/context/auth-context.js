import React from "react";

/**
 * Central storage to be accessed from anywhere in the component tree.
 */

export default React.createContext({
    token: null,
    userId: null,
    login: (token, userId, tokenExpiration) => {},
    logout: () => {}
});