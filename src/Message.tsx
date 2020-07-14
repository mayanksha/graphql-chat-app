/* eslint-disable import/first */
const React = require('react');
import { useState, useEffect, useRef } from 'react';

import auth from './auth/initAuth';
import Button from "@material-ui/core/Button";
import * as compose from 'lodash.flowright';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { graphql } from '@apollo/client/react/hoc';
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

import { getAllRoomsByUserID,
  getAllRoomsByUserIDAndRoomID,
  createNewRoomMutation,
  insertMultipleParticipantsToRoom,
  SenderReceiverRoomQuery,
  getGroupsByUserID,
} from './Room-Query';

import { useQuery, useApolloClient, useSubscription, ApolloClient, InMemoryCache } from '@apollo/client';

function createNewRoom(client: ApolloClient<InMemoryCache>,
  groupName: string | null,
  isGroup : boolean
) : Promise<any> {
  return client.mutate({
    mutation: createNewRoomMutation,
    variables: { roomName: groupName, isGroup: isGroup }
  });
};

function addParticipantsToRoomID(client: ApolloClient<InMemoryCache>,
  roomID: number,
  persons: number[]
) : Promise<any> {
  return client.mutate({
    mutation: insertMultipleParticipantsToRoom,
    variables: { objects: persons.map(p => { return { roomID: roomID, userID: p } })},
  });
};

const Message = props => {
  const client: ApolloClient<any> = useApolloClient();
  let emailIDMap = new Map();
  let IDemailMap = new Map();
  let groupIDNameMap = new Map();

  const chatBox = useRef(null);

  const [email, setEmail] = useState(null);
  const [timer, setTimer] = useState(null);

  const [receiverMail, setRecMail] = useState(null);
  const [message, setMessage] = useState('');

  const [room, setRoom] = useState(-1);

  const [messages, setMessages] = useState(Array<any>());
  const [newGroupMembers, setGroupMembers] = useState(Array<any>());
  const [userRooms, setUserRooms] = useState(Array<any>());
  const [newGroupName, setNewGroupName] = useState('');

  if (!email)
    setEmail(localStorage.getItem('email') as any);

  useEffect(() => {
    if (!localStorage.getItem('id_token')) {
      alert("You're not logged in. Redirecting to /.");
      props.history.push('/');
    }
  });

  let foo = useQuery(getAllRoomsByUserID, {
      variables: {
        'userID': 0
      }
    });

  let temp = useQuery(UserQuery);
  const [tLoading, tErr, tData] = [temp.loading, temp.error, temp.data];

  if (tLoading) console.log('tLoading');
  if (tErr) console.error('Erorr loading user data: ', tErr);

  if (tData) {
    tData.user.forEach((e) => {
      emailIDMap.set(e.username.toLowerCase(), e.id);
      IDemailMap.set(e.id, e.username.toLowerCase());
    });

    client.query({
      query: getGroupsByUserID,
      variables: { 'userID': emailIDMap.get(email) }
      }).then(e => e.data.rooms)
        .then(rooms => {
          setUserRooms(rooms);
          rooms.forEach(room => groupIDNameMap.set(room.id, room.roomName));
        })
      .catch(err => console.error('Group data fetching error: ', err));
  }

  useEffect(() => {
    props.message.subscribeToMore({
      document: MessageSubscription,
      variables: {
        roomID: room 
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMsgs = subscriptionData.data.messages;

        if (!prev) return { messages: newMsgs }; 
        else if (prev.messages.length === newMsgs.length)
          return prev;
        else {
          setMessages(newMsgs);
          return Object.assign({}, prev, {
            messages: newMsgs
          });
        } 
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
    receiverName,
    userLeft
  } = props;

  const handleChange = e => {
    setMessage(e.target.value);
  };

  const handleNewGroupNameChange = e => {
    setNewGroupName(e.target.value);
  };

  const handleSubmit = async (e, message, email) => {
    e.preventDefault();
    setMessage('');

    if (!message.length) return null;
    await props.createMessage({
      variables: {
        message: message,
        senderID: emailIDMap.get(email),
        roomID: room
      },
      update: (cache, { data: { createMessage } }) => {
        const data = cache.readQuery({ query: MessageQuery });

        setMessages((old) => old.concat([message]));
        cache.writeQuery({ query: MessageQuery, data });
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
  }

  const handleGroupCreationButtonClick = (e) => {
    e.preventDefault();

    console.log(newGroupName);
    console.log(newGroupMembers);

    alert('Creating a new group!');

    createNewRoom(client, newGroupName, true)
      .then((data) => {
          if (!data) return -1;
          else {
            console.log('Newly created Group Room: ', data.data.insert_rooms_one.id);

            setRoom(data.data.insert_rooms_one.id);
            return data.data.insert_rooms_one.id;
          }
        })
      .then((newRoomID: number) => {
        if (newRoomID === -1) return null;
        else return addParticipantsToRoomID(client, newRoomID, newGroupMembers.map(e => e.id));
      })
      .then(data => {
        if (!data) return null;
        console.log(data);
      })
      .catch(console.error); 
  }

  const handleGroupButtonClick = (e) => {
    e.preventDefault();
    

    // Reset stuff
    setMessages([]);
    setRoom(e.currentTarget.value);
    setRecMail(null);

    const senderID = emailIDMap.get(email);
    console.log(`Currently selected room: ${e.currentTarget.value}, sender: ${senderID}`);
  }

  const handleButtonClick = (e) => {
    e.preventDefault();
    const recMail = e.currentTarget.value;

    if (recMail === receiverMail)
      return;

    // Reset stuff
    setMessages([]);
    setRoom(-1);
    setRecMail(recMail);

    const senderID = emailIDMap.get(email), recvID = emailIDMap.get(recMail);

    console.log(`Sender: ${senderID}, Receiver: ${recvID}`);

    client.query({
      query: SenderReceiverRoomQuery,
      variables: { 'senderID': senderID, 'receiverID': recvID }
        }).then(data => data.data.rooms)
          .then((rooms: any[]) => {
            let personalRoomFound = false, currRoom = room;
            rooms.forEach((e) => {
              if (e.participants.length === 2 && e.participants[0].room.roomName === null) {
                personalRoomFound = true;
                currRoom = e.participants[0].roomID;
                setRoom(currRoom);
              }
            })

            console.log(`roomFound: ${personalRoomFound}, Room: ${currRoom}`);

            if (!personalRoomFound) return createNewRoom(client, null, false);
            else return null;
          })
          .then((data) => {
            if (!data) return -1;
            else {
              console.log('Newly created Room: ', data.data.insert_rooms_one.id);

              setRoom(data.data.insert_rooms_one.id);
              return data.data.insert_rooms_one.id;
            }
          })
          .then((newRoomID: number) => {
            if (newRoomID === -1) return null;
            else return addParticipantsToRoomID(client, newRoomID, [senderID, recvID]);
          })
          .then(console.log)
          .catch(console.error); 
    // Now we gotta create a room for these two people 
  }

  return (
    <div className="personal-chat" style={props.style}>
      <div className="chats-header">
        <p>Hi, {email}!</p>
        <button onClick={logout}> Click to logout !</button>
        <div className="back-button"></div>
        {/* <div className="user-typing">
         * {userTyping && userTyping === receiverMail
         * ? `${receiverName} is typing`
         * : receiverName}
         * </div> */}
      </div>
      <div className="select-user">
        <p key="users" className="cBlack">
          {" "}
          List of Users available to Chat{" "}
        </p>
        {tData
          ? tData.user.map((user) => (
              <Button
                variant="contained"
                color="primary"
                key={user.username}
                value={user.username}
                style={{ margin: 2 }}
                onClick={handleButtonClick}
              >
                {user.username}
              </Button>
            ))
          : ""}
        <div key="groups" className="cBlack marginTop10" >
          {" "}
          <p className="cBlack">
            {" "}
            List of Groups you're part of:
          </p>
          {
          userRooms.length !== 0
            ? userRooms.map((group) => (
                <Button
                  variant="contained"
                  color="primary"
                  key={group.id}
                  value={group.id}
                  style={{ margin: 2 }}
                  onClick={handleGroupButtonClick}
                >
                  {group.roomName}
                </Button>
              ))
            : "" 
          }
          { tData && email?
            <div>
            <TextField
              style={{ margin: 10 }}
              placeholder={"Group Name"}
              fullWidth
              name="message"
              value={newGroupName}
              onChange={handleNewGroupNameChange}
              margin="normal"
              variant="outlined"
            />
            <Autocomplete
              multiple
              className="marginTop10 marginBot10"
              options={tData.user}
              getOptionLabel={(option: any) => option.username}
              defaultValue={[tData.user.find(e => e.username === email)]}
              onChange={(e, val, reason) => setGroupMembers(val)}
              renderInput={(params) => (
                <TextField
                {...params}
                variant="standard"
                label="Select users to create a new group"
                placeholder="Search Users"
                />
                )}
            />
            <Button
              className="marginTop10"
              variant="contained"
              color="primary"
              onClick={handleGroupCreationButtonClick}
            >
              Create Group
            </Button>
            </div>
          : ""}
        </div>
      </div>
      <div className="all-messages">
        {room !== -1 ? (
          <form
            onSubmit={(e) => handleSubmit(e, message, email)}
            ref={chatBox}
            className="chat-box"
          >
          <TextField
            style={{ margin: 10 }}
            placeholder={"Say something to " + (receiverMail ? receiverMail : groupIDNameMap.get(room))}
            fullWidth
            name="message"
            value={message}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />
          </form>
        ) : (
          <div className="select-message">
            Select a user/group from the left panel
          </div>
        )}
        {messages.length ? messages.map((item: any) => (
            <div>
              {item ? (
                <div key={item.id} className={ item.senderID === emailIDMap.get(email) ? "sender" : "receiver" } >
                  {item.message}{" "}
                  <div>
                    <span className="time">
                      { item.senderID !== emailIDMap.get(email) ? (<span className="sender-name">{IDemailMap.size > 0? '~ ' + IDemailMap.get(item.senderID) : ''}</span>): '' }
                      
                      {" "}
                      {moment(item.timestamp).fromNow()}
                    </span>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            ))
          : ""}
      </div>
    </div>
  );
};

export default compose(
  graphql(MessageQuery, { name: 'message' }),
  graphql(CreateMessageMutation, { name: 'createMessage' }),
)(Message);
