import { EventEmitter } from 'events';
import { isTokenExpired } from './jwtHelper';
import auth0, { WebAuth } from 'auth0-js';

export default class AuthService extends EventEmitter {
  private auth0: auth0.WebAuth;

  constructor(clientId, domain) {
    super();
    // Configure Auth0
    this.auth0 = new WebAuth({
      clientID: clientId,
      domain: domain,
      responseType: 'token id_token',
      redirectUri: `${window.location.origin}/`
    });

    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.loginWithGoogle = this.loginWithGoogle.bind(this);
  };

  public login(username, password): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth0.client.login({ realm: 'Custom', username, password }, (err, authResult) => {
        if (err) 
          return reject(err);
       
        if (authResult && authResult.idToken && authResult.accessToken) {
          this.setToken(authResult.accessToken, authResult.idToken);
          localStorage.setItem('email', (username as string).toLowerCase());

          window.location = window.location.origin as any //redirect to main page
        }

        return resolve(authResult);
      })
    })
  }

  signup(email: string, password: string){
    this.auth0.redirect.signupAndLogin({
      connection: 'Custom',
      email,
      password,
    }, (err) => {
      if (err) {
        alert('Error: ' + err.description)
      } else {
        localStorage.setItem('email', (email as string).toLowerCase());
      }
    })
  }

  loginWithGoogle() {
    this.auth0.authorize({
      connection: 'google-oauth2',
    })
  }

  parseHash(hash) {
    this.auth0.parseHash({ hash }, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setToken(authResult.accessToken, authResult.idToken);
        console.log('AuthService parseHash : code to transition to /');

        this.auth0.client.userInfo(authResult.accessToken, (error, profile) => {
          if (error) {
            console.log('Error loading the Profile', error)
          } else {
            this.setProfile(profile)
          }
        })
      } else {
        console.error('Error: ' + authResult);
      }
    })
  }
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !isTokenExpired(token);
  }

  setToken(accessToken, idToken) {
    // Saves user access token and ID token into local storage
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('id_token', idToken)
  }

  setProfile(profile) {
    // Saves profile data to localStorage
    localStorage.setItem('profile', JSON.stringify(profile))
    // Triggers profile_updated event to update the UI
    this.emit('profile_updated', profile)
  }

  getProfile() {
    // Retrieves the profile data from localStorage
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(localStorage.profile) : {}
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
  }

  logout() {
    this.auth0.logout({clientID: process.env.REACT_APP_AUTH_CLIENT_ID});

    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('email');
    localStorage.removeItem('profile');
  }
}
