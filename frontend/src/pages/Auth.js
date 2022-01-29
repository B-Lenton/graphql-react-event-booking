import React, { Component } from "react";

import "./Auth.css";

class AuthPage extends Component {
    // could instead set up two-way binding, manage state & listen to changes
    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }
// TODO: Uncomment and continue below:
    // submitHandler = () => {
    //     const email = this.emailEl.current.value;
    //     const password = this.passwordEl.current.value;


    // };


    render() {
        return (
            <form className="auth-form">
                <div className="form-control">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" ref={this.emailEl}></input>
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl}></input>
                </div>
                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <button type="button">Switch to Signup</button>
                </div>
            </form>
        );
    }
}

export default AuthPage;