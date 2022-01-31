import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import "./Events.css";

class EventsPage extends Component {
    state = {
        creating: false
    };

    static contextType = AuthContext;

    constructor(props) {
        // creating references to each modal input for event creation
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    startCreateEventHandler = () => {
        this.setState({creating: true});
    };

    modalConfirmHandler = () => {
        this.setState({ creating: false });
        // store the current value on 'submit' of each input field
        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;

        if (title.trim().length === 0 || 
            price <= 0 || 
            date.trim().length === 0 || 
            description.trim().length === 0) {
            return;
        }
        // store information in event variable
        const event = {title, price, date, description};
        console.log(event);

        const requestBody = {
            query: `
                mutation {
                    createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: ${date}}) {
                        _id
                        title
                        description
                        price
                        date
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        const token = this.context.token;

        fetch("http://localhost:8000/graphql", {
            // configure the request
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                // ensure the GraphQL backend parses incoming data as JSON
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Failed");
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData);
            })
            .catch(err => {
                console.log(err);
            });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false });
    };

    render() {
        return (
            <React.Fragment>
                {this.state.creating && (
                    <React.Fragment>
                        <Backdrop></Backdrop>
                        <Modal 
                            title="Add Event" 
                            canCancel 
                            canConfirm 
                            onCancel={this.modalCancelHandler} 
                            onConfirm={this.modalConfirmHandler}
                        >
                            <form>
                                <div className="form-control">
                                    <label htmlFor="title">Title</label>
                                    <input type="text" id="title" ref={this.titleElRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="price">Price</label>
                                    <input type="number" id="price" ref={this.priceElRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="date">Date</label>
                                    <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                                </div>
                                <div className="form-control">
                                    <label htmlFor="description">Description</label>
                                    <textarea rows="4" id="description" ref={this.descriptionElRef}></textarea>
                                </div>
                            </form>
                        </Modal>
                    </React.Fragment>
                )}
                {/* {this.context.token && ( */}
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
                    </div>
                {/* )} */}
            </React.Fragment>
        );
    }
}

export default EventsPage;