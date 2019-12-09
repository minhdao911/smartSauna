import React, { Component } from 'react';
import { connect } from 'react-redux';

import './index.scss';

import { roomsOperations } from '../../redux/rooms';
import { notificationsOperations } from '../../redux/notifications';

import RoomList from '../../shared/RoomList';
import Condition from './Condition';
import Weather from './Weather';
import NotiBoard from './NotiBoard';

import { withAuthorization } from '../../shared/Session';

import { notification } from 'antd';

class Monitoring extends Component{
    constructor(props){
        super(props);
        this.state = {
            chosenRoom: '',
            intervalId: null,
            notiModalVisible: false,
        }
    }

    registerPushListener = () =>
    navigator.serviceWorker.addEventListener("message", ({ data }) => {
        console.log(data);
        const noti = data.notification ? data.notification : data["firebase-messaging-msg-data"].notification;
        notification.open({
            message: noti.title,
            description: noti.body
        })
    });

    componentDidMount(){
        console.log('authUser', this.props.authUser);
        const { messaging } = this.props.firebase;
        messaging.requestPermission()
        .then(() => {
            console.log('Have permission');
            return messaging.getToken();
        })
        .then((token) => {
            console.log(token);
        })
        .catch(() => {
            console.log('Error occured');
        });

        this.registerPushListener();

        this.props.fetchNotifications();

        this.props.fetchRoomData();
        const intervalId = setInterval(() => {
            this.props.fetchRoomData();
        }, 30000);
        this.setState({intervalId});
    }

    componentDidUpdate(prevProps){
        const { rooms } = this.props;
        if(prevProps.rooms !== rooms){
            this.setState({
                chosenRoom: rooms[0]
            })
        }
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId);
    }

    updateChosenRoom = (newRoom) => {
        this.setState({
            chosenRoom: newRoom
        })
    }

    onNotiFormSubmit = (desc) => {
        const { createNotification } = this.props;
        createNotification(desc);
    }

    render(){
        const { rooms, isRoomLoading, notifications, isNotiLoading } = this.props;
        const { chosenRoom } = this.state;
        return (
            <div className="monitoring">
                <div className="monitoring__div">
                    <RoomList list={rooms} isLoading={isRoomLoading} updateChosenRoom={this.updateChosenRoom} chosenRoom={chosenRoom}/>
                    <Condition data={chosenRoom} isLoading={isRoomLoading}/>
                </div>
                <div className="monitoring__div">
                    <Weather />
                    <NotiBoard list={notifications} isLoading={isNotiLoading} onNotiFormSubmit={this.onNotiFormSubmit}/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({rooms, notifications}) => {
    const { roomData, isRoomLoading } = rooms;
    const { notiData, isNotiLoading } = notifications;
    return {
      rooms: roomData,
      isRoomLoading,
      notifications: notiData,
      isNotiLoading,
    };
  };
  
  const mapDispatchToProps = dispatch => {
    const fetchRoomData = () => dispatch(roomsOperations.fetchRoomData());

    const fetchNotifications = () => dispatch(notificationsOperations.fetchNotifications());
    const createNotification = (description) => dispatch(notificationsOperations.createNotification(description)); 

    return { 
        fetchRoomData,
        fetchNotifications,
        createNotification,
    };
  };

const condition = authUser => !!authUser;

export default withAuthorization(condition)(connect(mapStateToProps, mapDispatchToProps)(Monitoring));