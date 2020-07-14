import { gql } from '@apollo/client';

const MessageQuery = gql`
  query {
    messages {
      id
      message
      roomID
      senderID
      timestamp
    }
  }
`;

const CreateMessageMutation = gql`
mutation MyMutation ($message: String!, $roomID: Int, $senderID: Int) {
  insert_messages(objects: {message: $message, roomID: $roomID, senderID: $senderID}) {
    returning {
      id
      message
      roomID
      senderID
      timestamp
    }
  }
}
`;


/* const UserTypingMutation = gql`
 *   mutation($email: String!, $receiverMail: String!) {
 *     userTyping(email: $email, receiverMail: $receiverMail)
 *   }
 * `; */

const MessageSubscription = gql`
  subscription onMessageAdded($roomID: Int) {
    messages(where: {roomID: {_eq: $roomID}}, order_by: {timestamp: desc}) {
      id
      message
      roomID
      senderID
      timestamp
    }
  }
`;

/* const UserTypingSubscription = gql`
 *   subscription($receiverMail: String!) {
 *     userTyping(receiverMail: $receiverMail)
 *   }
 * `; */

export {
  MessageQuery,
  CreateMessageMutation,
  /* UserTypingMutation, */
  MessageSubscription,
};
