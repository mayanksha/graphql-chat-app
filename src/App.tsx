/* eslint-disable import/first */
const React = require('react');

import { useState, useEffect } from 'react';
import User from './User';
import Message from './Message';
import Registration from './Frontpage';

import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';

import { gql, useQuery } from '@apollo/client';

import {
  UserQuery,
  CreateUserMutation,
  DeleteUserMutation,
  AddUserSubscription,
  DeleteUserSubscription
} from './User-Query';

/* const runQuery = (props) => {
 *   return render(
 *     <div>
 *       )
 * } */

const App = (props) => {
  const user = (localStorage.getItem('token') &&
      JSON.parse(localStorage.getItem('token') as string)) ||
    {};

  let [loading, error, data] = [null, null, null];

  const [receiverState, setReceiverState] = useState({
    receiverMail: '',
    receiverName: ''
  });

  const [userLeft, setUserLeft] = useState('');

  const [hidden, setHidden] = useState(false);

  const setSelectedMail = (mail, user) => {
    setReceiverState(receiverState => {
      return { ...receiverState, receiverMail: mail, receiverName: user };
    });
    setHidden(!hidden);
  };

  const setStyle = () => {
    setHidden(!hidden);
  };

/*   useEffect(() => {
 *     const subscribeToMore = props.data.subscribeToMore;
 *     subscribeToMore({
 *       document: AddUserSubscription,
 *       updateQuery: (prev, { subscriptionData }) => {
 *         if (!subscriptionData.data) return prev;
 *         const user = subscriptionData.data.newUser;
 *         if (!prev.users.find(x => x.id === user.id)) {
 *           return { ...prev, users: [...prev.users, user] };
 *         }
 *         return prev;
 *       }
 *     });
 * 
 *     subscribeToMore({
 *       document: DeleteUserSubscription,
 *       updateQuery: (prev, { subscriptionData }) => {
 *         if (!subscriptionData.data) return prev;
 *         const oldUser = subscriptionData.data.oldUser;
 *         if (prev.users.some(x => x.email === oldUser)) {
 *           const newUsers = prev.users.filter(x => x.email !== oldUser);
 *           prev.users = newUsers;
 *           return prev;
 *         }
 *         setUserLeft(oldUser);
 *         return prev;
 *       }
 *     }); 
 *   }, [props.data]); */

  const createUser = async (email, name) => {
    await props.createUser({
      variables: {
        email,
        name
      },
      update: (store, { data: { createUser } }) => {
        const data = store.readQuery({ query: UserQuery });
        if (!data.users.find(x => x.id === createUser.id)) {
          data.users.push(createUser);
        }
        store.writeQuery({ query: UserQuery, data });
      }
    }); 
  };

  let temp = useQuery(UserQuery);
  const [tLoading, tErr, tData] = [temp.loading, temp.error, temp.data];

  if (tLoading) console.log('Loading');
  if (tErr) console.error(tErr);


  const deleteUser = async email => {
    localStorage.removeItem('token');
    await props.deleteUser({
      variables: { email },
      update: store => {
        const data = store.readQuery({ query: UserQuery });
        data.users = data.users.filter(x => x.email !== email);
        store.writeQuery({ query: UserQuery, data });
      }
    }); 
  };

  const { receiverMail, receiverName } = receiverState;

  let users = null;
  [users, error, loading] = [props.data.users, props.data.error, props.data.loading];

  /* if (loading || error) return null; */
  if (localStorage.getItem('token')) {
    return (
      <div className="chat-page">
        <p> Chat Page</p>
        <User
          style={{ display: 'block' }}
          users={users}
          email={user.email}
          name={user.name}
          selectedMail={setSelectedMail}
          deleteUser={deleteUser}
        />
        <Message
          style={{ display: 'block' }}
          email={user.email}
          receiverMail={receiverMail}
          receiverName={receiverName}
          userLeft={userLeft}
          name={user.email}
          setStyle={setStyle}
        />
      </div>
    );
  }
  return <Registration users={users} createUser={createUser} />;
};

export default compose(
  graphql(UserQuery),
  graphql(CreateUserMutation, { name: 'createUser' }),
  graphql(DeleteUserMutation, { name: 'deleteUser' })
)(App);
