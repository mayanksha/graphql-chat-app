import { gql } from '@apollo/client';

const UserQuery = gql`
  query {
    user {
      id
      username
    }
  }
`;

const UserQueryByEmail = gql`
query ($username: String!){
  rooms {
    id
    users
  }
  user(where: {username: {_eq: $username}})
}
`;

const CreateUserMutation = gql`
  mutation($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      returning {
        id
        creationDate
        username
      }
    }
  }
`;

const DeleteUserMutation = gql`
  mutation($username: String!) {
    deleteUser(email: $username)
  }
`;

const AddUserSubscription = gql`
  subscription {
    newUser {
      username 
      id
    }
  }
`;

const DeleteUserSubscription = gql`
  subscription {
    oldUser
  }
`;

export {
  UserQuery,
  CreateUserMutation,
  DeleteUserMutation,
  AddUserSubscription,
  DeleteUserSubscription
};
