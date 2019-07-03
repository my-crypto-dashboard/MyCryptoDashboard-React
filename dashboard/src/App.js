import React, {Component} from 'react';
import './App.scss';
import NavBar from './Components/Navigation/NavBar'
import { Route } from 'react-router-dom'
import Favorites from './Components/Favorites/Favorites'
import About from './Components/About/About'
import Wallets from './Components/Wallets/Wallets'
import Dashboard from './Components/Dashboard/Dashboard'
import fire from './config/firebase';
import firebase from 'firebase';
import Chart from './Components/Charts/chart';
// import Footer from './Components/Footer/Footer'



class App extends Component {

  constructor() {
    super();
    this.state = {
      user: null
    }
  }

  

  componentDidMount() {
    this.authListener();

    let db = fire.firestore();
    let pair  = ['bitcoin', 'eth']
    return db.collection("users")
        .doc(this.state.user.id) //<--- id of user who left erview, same as above, state.userId
        .update({ favorites: firebase.firestore.FieldValue.arrayUnion(pair) })
        .then((res) => {
          console.log(res);
        })
        .catch(err => {
          console.log("error adding reviewid to reviews array in user");
          return null;
        });
  }

  authListener() {
    let db = fire.firestore();
      fire.auth().onAuthStateChanged((user) => {
        if(user) {
          db
          .collection("users")
          .doc(user.uid)
          .get().then(docSnapshot => {
            this.setState({user: docSnapshot.data()});
          })
        
      } else {
        this.setState({user:null});
      }
    });
  }

  login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    let db = fire.firestore();
    return fire.auth()
    .signInWithPopup(provider)
    .then(async result => {
      await db
      .collection("users")
      .doc(result.user.uid)
      .get().then(docSnapshot => {
        if(!docSnapshot.data()){
            db.collection("users")
            .doc(result.user.uid)
            .set({
              email: result.user.email,
              id: result.user.uid,
              favorites: []
            });
            this.setState({user: {
              email: result.user.email,
              id: result.user.uid,
              favorites: []
            }});
        }
      })
      .catch(err => {
        console.log(err);
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  logout() {
    fire.auth().signOut()
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })
  }
  
  showCrypto(coin) {
    console.dir(coin.value);
  }
  render(){

    return (
       
      <div className="App">
        <Chart/>
      <NavBar user={this.state.user} login={this.login} logout={this.logout}/>
        <Route exact path="/dashboard" render={ (props) => {
            return(<Dashboard {...props} showCrypto={this.showCrypto} />)
          }} />
        
        <Route exact path="/favorites" render={ (props) => {
            return(<Favorites {...props}  ids={['bitcoin','ethereum','abcc-token','bitBTC','acepay']} />)
          }} />
        <Route exact path="/about" render={ (props) => {
            return(<About {...props} />)
          }} />
          <Route exact path="/wallets" render={ (props) => {
            return(<Wallets {...props} />)
          }} />
        
      </div>
      
      
    );

  }

  
 
}

export default App;
