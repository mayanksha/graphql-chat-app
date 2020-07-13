/* eslint-disable import/first */
const React = require('react');

import { useCallback } from "react";
import Button from "@material-ui/core/Button";
import { useQuery } from '@apollo/client';
import {
  UserQuery,
  CreateUserMutation,
  DeleteUserMutation,
  AddUserSubscription,
  DeleteUserSubscription
} from './User-Query';

const User = props => {
  const { users, email, name, selectedMail, deleteUser } = props;

  let temp = useQuery(UserQuery);
  const [tLoading, tErr, tData] = [temp.loading, temp.error, temp.data];

  if (tLoading) console.log('Loading');
  if (tErr) console.error(tErr);

  console.log(tData);

  const selectUserFunction = useCallback((mail, user) => {
    selectedMail(mail, user);
  }, [selectedMail]);

  const deleteUserFunction = useCallback(() => {
    deleteUser(email);
  }, [deleteUser, email]);

  return (
    <div className="user-welcome" style={props.style}>
      <div className="user-heading">
      
      { users? users.map(user => (<Button variant="contained" color="primary">{user.username}</Button>)) : ''}
      <p>Hello, {name}</p>
        <Button
          className="leave"
          size="small"
          variant="outlined"
          onClick={deleteUserFunction}
        >
          Leave Chat?
        </Button>
      </div>

      <div className="select-user">
        {users.map(item =>
          item.email !== email ? (
            <div
              key={item.username}
              className="users"
              onClick={() => selectUserFunction(item.email, item.name)}
            >
              {item.name}
            </div>
          ) : (
            ""
          )
        )}
      </div>
    </div>
  );
};

export default User;
