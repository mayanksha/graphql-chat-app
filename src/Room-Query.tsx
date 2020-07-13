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

export {
  getAllRoomsByUserID,
  getAllRoomsByUserIDAndRoomID
};
