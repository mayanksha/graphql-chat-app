/* eslint-disable import/first */
const React = require('react');

import { useState } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import validator from "validator";

/* import { gql, useQuery } from '@apollo/client'; */
import SignUp from './components/SignUp';
import Login from './components/Login';

import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component='div'>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Login" id="simple-tab-0" aria-controls="simple-tabpanel-0"/>
          <Tab label="SignUp" id="simple-tab-1" aria-controls="simple-tabpanel-1"/>
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Login/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SignUp/>
      </TabPanel>
    </div>
  );
}

const Registration = props => {
  console.log("Hurr");
  const [token, setToken] = useState({ name: "", email: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setToken({ ...token, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email } = token;

    const existingUser = props.users.some(function(user) {
      return user.email === email;
    });

    if (!name.length) {
      setError("Name is required");
    }

    if (!validator.isEmail(email)) {
      setError("Valid email is required");
    }

    if (existingUser) {
      setError("Email already in use");
    }

    if (name.length && validator.isEmail(email) && !existingUser) {
      setError("");
      props.createUser(email, name);
      localStorage["token"] = JSON.stringify(token);
    }
  };

  const { name, email } = token;
  return (
  <div>
      <SimpleTabs/> 
      {
    /* <Paper elevation={3} className="paper">
     *   <Login/>
     *   <SignUp/>
     *   <hr></hr>
     *   User Details
     *   <TextField
     *     required
     *     id="outlined-name"
     *     label="Name"
     *     name="name"
     *     value={name}
     *     onChange={handleChange}
     *   />
     *   <TextField
     *     required
     *     id="outlined-email-input"
     *     type="email"
     *     label="Email"
     *     name="email"
     *     value={email}
     *     onChange={handleChange}
     *     className="text-area"
     *   />
     *   <Button variant="contained" onClick={validate} style={{ margin: 15 }}>
     *     Enter Chat
     *   </Button>
     *   <div>{error}</div>
     * </Paper> */
      }
  </div>
  );
};

export default Registration;
