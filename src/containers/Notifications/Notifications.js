import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './Notifications.css';
import Notification from './Notification';

export class Notifications extends Component {
    static mapStateToProps({ Notifications }) {
        return { pushedNotification: Notifications.pushedNotification.data };
    }

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            notification: null,
            pendingNotification: null
        };
    }

    componentWillReceiveProps({ pushedNotification }) {
        const { open, notification } = this.state;

        if (open && notification) {
            this.setState({
                open: false,
                pendingNotification: pushedNotification
            });
        } else {
            this.setState({
                open: true,
                notification: pushedNotification,
                pendingNotification: null
            });
        }
    }

    handleNotificationClose() {
        this.setState({ open: false });

        if (this.state.pendingNotification) {
            this.setState({
                open: true,
                notification: { ...this.state.pendingNotification },
                pendingNotification: null
            });
        }
    }

    render() {
        const { open, notification } = this.state;

        return (
            <div className="notifications">
                <Notification
                    open={open}
                    notification={notification}
                    onClose={() => this.handleNotificationClose()}
                />
            </div>
        );
    }
}

Notifications.propTypes = {
    pushedNotification: PropTypes.object
};

export default connect(Notifications.mapStateToProps)(Notifications);