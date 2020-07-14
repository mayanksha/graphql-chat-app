import { gql } from '@apollo/client';

const getAllRoomsByUserID = gql`
query MyQuery ($userID: Int!) {
   participants(where: {userID: {_eq: $userID}}) {
    roomID
    userAddedOn
    userID
  }
}
`;

const getAllRoomsByUserIDAndRoomID = gql`
query MyQuery ($roomID: Int, $userID: Int) {
   participants(where: {userID: {_eq: $userID}, roomID: {_eq: $roomID}}) {
    roomID
    userAddedOn
    userID
  }
}
`;

const createNewRoomMutation = gql`
mutation MyMutation ($roomName: String, $isGroup: Boolean) {
  insert_rooms_one(object: {roomName: $roomName, isGroup: $isGroup}) {
    id
    isGroup
    createdOn
  }
}
`;

const insertMultipleParticipantsToRoom = gql`
mutation MyMutation($objects: [participants_insert_input!]! = {}) {
  insert_participants(objects: $objects) {
    returning {
      roomID
      userID
      userAddedOn
    }
  }
}
`;

const SenderReceiverRoomQuery = gql`
query MyQuery($senderID: Int!, $receiverID: Int!) {
  rooms {
    participants(where: {userID: {_in: [$senderID, $receiverID]}}) {
      roomID
      userID
      userAddedOn
      room {
        roomName
      }
    }
  }
}
`;

const getGroupsByUserID = gql`
query getGroupsByUserID ($userID: Int!) {
  rooms(where: {participants: {userID: {_eq: $userID}}, isGroup: {_eq: true}}) {
    id
    isGroup
    createdOn
    roomName
  }
}
`;

export {
  getAllRoomsByUserID,
  getAllRoomsByUserIDAndRoomID,
  createNewRoomMutation,
  SenderReceiverRoomQuery,
  insertMultipleParticipantsToRoom,
  getGroupsByUserID,
};
