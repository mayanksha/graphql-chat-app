import React, { FormEvent } from 'react';
import { withRouter } from 'react-router';
import auth from './../auth/initAuth';
import TextField from "@material-ui/core/TextField";

interface MyError extends Error {
  description: string | null
};

type MyState = { email: string, password: string, error: MyError | null };
type MyProps = { _refresh?: () => void };

class Login extends React.Component<any, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: null
    }
  }

  _nextPath(path) {
    this.props.history.push(path);
  }

  _handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    auth.login(this.state.email, this.state.password)
      .then((res) => this._nextPath('/chat'))
      .catch(err => {
        console.error(err);
        this.setState({ error: err })
      });
  }

  _handleEmailChange = (e) => {
    this.setState( {email: e.target.value} );
  }

  _handlePasswordChange = (e) => {
    this.setState( {password: e.target.value} );
  }

  _logout = () => {
    console.log("Logging out!");
    auth.logout();

    if (this.props._refresh)
      this.props._refresh();
  }

  _renderLoginForm = () => {
    return(
    <div>
      <p style={{ color: 'red' }}>{this.state.error? `'Error': ${this.state.error.description}`: ''}</p>
      <span>Login Status: {auth.loggedIn() ? 'Logged In': 'Not logged in'}</span>
      <form className="commentForm" onSubmit={this._handleSubmit}>
      <TextField required variant="outlined" type="email" placeholder="Enter your email" onChange={this._handleEmailChange} style={{ margin: 10 }}/>
      <TextField required variant="outlined" type="password" placeholder="Enter a password" onChange={this._handlePasswordChange} style={{ margin: 10 }}/>
      <input type="submit" value="Login" />
      </form>
    </div>
    )
  }

  _renderLogout = () => {
    return(
      <div>
      <button onClick={ this._logout }>You are logged in ! Click to logout !</button>
      </div>
    )
  }

  render(){
    return(
      <div>
      { auth.loggedIn() ? this._renderLogout() : this._renderLoginForm() }
      </div>
    )
  }
}
export default withRouter(Login);
