import React, { FormEvent } from 'react';
import auth from '../auth/initAuth';
import TextField from "@material-ui/core/TextField";


type MyState = { email: string, password: string };
type MyProps = {  };

class SignUp extends React.Component<MyProps, MyState> {
  constructor(props){
    super(props);

    this.state = {
      email: '',
      password: '' 
    }
  }

  _handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    auth.signup(this.state.email, this.state.password);
    localStorage.setItem('email', this.state.email);
  }

  _handleEmailChange = (e) => {
    this.setState( {email: e.target.value} );
    console.log('email', this.state.email);
  }

  _handlePasswordChange = (e) => {
    this.setState( {password: e.target.value} );
    console.log('password', this.state.password);
  }

  render() {
    return(
    <div>
      <span>Login Status: {auth.loggedIn() ? 'Logged In': 'Not logged in'}</span>
      <form className="commentForm" onSubmit={this._handleSubmit}>
        <TextField required variant="outlined" type="email" placeholder="Enter your email" onChange={this._handleEmailChange} style={{ margin: 10 }}/>
        <TextField required variant="outlined" type="password" placeholder="Enter a password" onChange={this._handlePasswordChange} style={{ margin: 10 }}/>
        <input type="submit" value="SignUp" />
      </form>
    </div>
    )
  }
}
export default SignUp
