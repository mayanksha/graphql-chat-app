/* eslint-disable import/first */
const React = require('react');
import { useState, useEffect, useRef } from 'react';

import auth from './auth/initAuth';
import Button from "@material-ui/core/Button";
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';
import {
  MessageQuery,
  CreateMessageMutation,
  MessageSubscription,
} from './Message-Query';

import {
  UserQuery,
  CreateUserMutation,
  DeleteUserMutation,
  AddUserSubscription,
  DeleteUserSubscription
} from './User-Query';

import { getAllRoomsByUserID, getAllRoomsByUserIDAndRoomID } from './Room-Query';

import { useQuery, useApolloClient } from '@apollo/client';

const Message = props => {
  const client = useApolloClient();
  let email: string | null = null;
  let emailIDMap = new Map();

  useEffect(() => {
    email = localStorage.getItem('email');
    if (!localStorage.getItem('id_token')) {
      alert("You're not logged in. Redirecting to /.");
      props.history.push('/');
    }
      });

  const chatBox = useRef(null);
  const [recMail, setRecMail] = useState(null);
  const [room, setRoom] = useState(-1);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(Array<any>());

  const [timer, setTimer] = useState(null);

  const handleShow = () => {
    /* props.setStyle(); */
  };

  let foo = useQuery(getAllRoomsByUserID, {
      variables: {
        'userID': 0
      }
    });

  let temp = useQuery(UserQuery);
  const [tLoading, tErr, tData] = [temp.loading, temp.error, temp.data];

  if (tLoading) console.log('Loading');
  if (tErr) console.error(tErr);

  if (tData) {
    tData.user.forEach((e) => {
        emailIDMap.set(e.username, e.id);
      });
  }

  useEffect(() => {
    props.message.subscribeToMore({
      document: MessageSubscription,
      variables: {
        roomID: room 
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const msg = subscriptionData.data;
        setMessages((old) => msg.messages)
      }
    });

    if (chatBox.current) {
      scrollToBottom();
    }
  }); 

  const scrollToBottom = () => {
    (chatBox as any).current.scrollIntoView();
  };

  let {
    message: { error, loading },
    receiverMail,
    receiverName,
    userLeft
  } = props;

  const handleChange = async e => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e, message, email) => {
    console.log(message);
    setMessage('');
    e.preventDefault();

    if (!message.length) return null;
    await props.createMessage({
      variables: {
        message: message,
        senderID: emailIDMap.get(email),
        roomID: room
      },
      update: (store, { data: { createMessage } }) => {
        const data = store.readQuery({ query: MessageQuery });
        setMessages((old) => [...old, createMessage])
        store.writeQuery({ query: MessageQuery, data });
      }
    }); 
  };

  if (error || loading) return null;

  const queryForRoomsUsingUserID = (roomID, userID) => {
    return client.query({
      query: getAllRoomsByUserIDAndRoomID,
      variables: { 'userID': userID, 'roomID': roomID }
    }) 
  }

  const logout = () => {
    console.log("Logging out!");
    auth.logout();

    localStorage.removeItem('email');
  }

  const handleButtonClick = (e) => {
    receiverMail = e.currentTarget.value;
    setRecMail(e.currentTarget.value);

    const senderID = emailIDMap.get(email), recvID = emailIDMap.get(recMail);

    setRoom(5);
    /* client.query({
     *   query: getAllRoomsByUserID,
     *   variables: { 'userID': senderID }
     *   }).then((res) => {
     *     for (let i of (res.data.participants as any[])) {
     *       queryForRoomsUsingUserID(i.roomID, recvID)
     *         .then((data) => data.data.participants)
     *         .then((data: any[]) => {
     *           data.forEach(e => { 
     *           if (e.userID === senderID)
     *             setRoom(e.roomID);
     *           });
     *         })
     *     }
     *     }) */
        /* Promise.all((res.data.participants as any[]).map(e => queryForRoomsUsingUserID(e.roomID, recvID)))) */
    // Now we gotta create a room for these two people 
  }

  return (
    <div className="personal-chat" style={props.style}>
      <div className="chats-header">
        <p>Hi, { localStorage.getItem('email') }!</p>
        <button onClick={ logout }> Click to logout !</button>
        <div className="back-button" onClick={handleShow}>
        </div>
        { /* <div className="user-typing">
         * {userTyping && userTyping === receiverMail
         * ? `${receiverName} is typing`
         * : receiverName}
         * </div> */ }
      </div>
      <div className="select-user">
        <p className="cBlack"> List of Users available to Chat </p>
      { tData? tData.user.map(user => 
      (<Button
        variant="contained"
        color="primary"
        key={user.username}
        value={user.username}
        style={{ margin: 2 }}
        onClick={handleButtonClick}
        >{user.username}
        
      </Button>)) : ''}
        </div>
      <div className="all-messages">
      
        {recMail ? (
          <form
            onSubmit={e => handleSubmit(e, message, email)}
            ref={chatBox}
            className="chat-box"
          >
            <TextField
              style={{ margin: 10 }}
              placeholder={'Say something to ' + recMail}
              fullWidth
              name="message"
              value={message}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
            />
          </form>
        ) : ( <div className="select-message">
            Select a logged in user from the left panel
          </div>)
        }
        { messages.length }
        { messages.length ?
        messages.map((item: any) =>
          (
          <div>
          {
            item? (<div key={item.id} className={item.senderID === emailIDMap.get(email) ? 'sender' : 'sender' }>
              {item.message}{' '}
              <span className="time"> {moment(item.timestamp).fromNow()}</span>
            </div>) : ('')
          }
            
          </div>
          )
        ) : ('')
        }
      </div>
    </div>
  );
};

export default compose(
  graphql(MessageQuery, { name: 'message' }),
  graphql(CreateMessageMutation, { name: 'createMessage' }),
)(Message);
