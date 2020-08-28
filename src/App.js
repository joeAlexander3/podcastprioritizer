import React, { Component } from "react";
import axios from "axios";
import MapMode from './MapMode'
import PodcastItem from "./PodcastItem";
import PodcastMenu from './PodcastMenu';
import firebase from "./database";
import Error from "./Error";
import HeaderSection from "./HeaderSection";
import InputForm from './InputForm';
import {podcastAPI, mapquestAPI} from './api.js';

const modes = ["bicycle", "pedestrian", "fastest"]

class App extends Component {
  constructor() {
    super();
    this.state = {
      transitTime: {},
      podcasts: [],
      mapUrl: "",
      loggedIn: false,
      userId: "anonymous",
      podcastList: [],
      popUpError: false,
      tooBig: false,
      menuOpen: false,
      apiError: false,
      podcastInput: "",
      userInputFrom: "",
      userInputTo: "",
    };
  }

  /************************/
  /*   handleTextInput   */
  /**********************/
  handleTextChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  /************************/
  /* User Authentication */
  /**********************/
  // Login method for Google Authentication
  login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const auth = firebase.auth();

    auth.signInWithPopup(provider).then((result) => {
      const user = result.user;
      this.setState({
        userId: user.uid,
        loggedIn: true
      })
    })
  }

  // Logout method for Google Authentication
  logout = () => {
    const auth = firebase.auth();
    auth.signOut().then(() => {
      this.setState({
        userId: "",
        podcastList: [],
        loggedIn: false
      })
    })
  }

  /*********************************/
  /* Podcast Menu and Save/Delete */
  /*******************************/
  // Set the open and close state for the menu button
  podcastMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen
    })
  }

  // Save podcast to user list when button is clicked
  savePodcast = (e, title, image, audio, id) => {
    // Prevent default
    e.preventDefault();

    const dbRef = firebase.database().ref();

    // Create a new object with required items
    const podcast = {
      title: title,
      image: image,
      audio: audio,
    }

    // Go to the user's ID and the podcast ID and set the above object
    dbRef.child(`${this.state.userId}/${id}`).set(podcast)
  }

  // Delete podcast item from the user's list
  deletePodcast = (e, key) => {
    // Prevent default
    e.preventDefault();

    // Go to the user's ID in the database
    const dbRef = firebase.database().ref(this.state.userId);

    // Remove the podcast based on its ID
    dbRef.child(key).remove();
  }

  /**************/
  /* API CALLS */
  /*************/
  handleSubmit = (e, from, to, podcast) => {
    // Prevent default
    e.preventDefault();

    // Axios call to mapquest API to get the map of the route  
    axios({
      url: `https://www.mapquestapi.com/staticmap/v5/map`,
      method: `GET`,
      responseType: `json`,
      params: {
        key: mapquestAPI,
        format: `png`,
        start: from,
        end: to,
        size: `300,300`,
        countryCode: `CA`,
        scalebar: true,
        margin: 40,
      },
    }).then((res) => {
      this.setState({ mapUrl: res.request.responseURL });
    }).catch(() => {
      this.setState({
        apiError: true
      })
    });

    axios({
      url: `https://www.mapquestapi.com/directions/v2/route`,
      method: `GET`,
      responseType: `json`,
      params: {
        key: mapquestAPI,
        from: from,
        to: to,
      },
    })
      .then((res) => {
        // If distance is greater than 100 miles, do not continue and show error
        if (res.data.route.distance > 100) {
          this.setState({
            tooBig: true,
          })
        } else {
          // For each mode of transportation, find the transit time, convert it to minutes and save it to state
          modes.forEach((mode) => {
            axios({
              url: `https://www.mapquestapi.com/directions/v2/route`,
              method: `GET`,
              responseType: `json`,
              params: {
                key: mapquestAPI,
                from: from,
                to: to,
                routeType: mode,
              },
            })
              .then((res) => {
                const timeCopy = { ...this.state.transitTime }
                timeCopy[mode] = this.timeChange(res.data.route.formattedTime);
                this.setState({
                  transitTime: timeCopy,
                  tooBig: false
                });
              })
              .then(()=>{
                axios({
                  url: `https://listen-api.listennotes.com/api/v2/search`,
                  method: `GET`,
                  responseType: `json`,
                  headers: {
                    "X-ListenAPI-Key": podcastAPI,
                  },
                  params: {
                    q: podcast,
                    len_max: this.state.transitTime.pedestrian,
                  },
                }).then((res) => {
                  this.setState({
                    podcasts: res.data.results,
                  });
                }).catch(() => {
                  this.setState({
                    apiError: true
                  })
                });
              })
              .catch(() => {
                this.setState({
                  popUpError: true,
                })
              });
          });
        }
      }
    ).catch(() => {
      this.setState({
        apiError: true
      })
    });
  };

  // making an API call for PODCAST
  // podcastCall = (e, inputText) => {
  //   // Prevent default
  //   e.preventDefault();

  //   // call the listennotes API and search for podcasts
  //   axios({
  //     url: `https://listen-api.listennotes.com/api/v2/search`,
  //     method: `GET`,
  //     responseType: `json`,
  //     headers: {
  //       "X-ListenAPI-Key": podcastAPI,
  //     },
  //     params: {
  //       q: inputText,
  //       len_max: this.state.transitTime.pedestrian,
  //     },
  //   }).then((res) => {
  //     this.setState({
  //       podcasts: res.data.results,
  //     });
  //   }).catch(() => {
  //     this.setState({
  //       apiError: true
  //     })
  //   });
  // };

  // function to modify time from 00:00:00 format to minutes
  timeChange = (time) => {
    const arr = time.split(":");
    const add = parseInt(arr[0] * 60) + parseInt(arr[1]) + parseInt(arr[2] / 60);
    return add;
  };

  /*****************/
  /* Clear Results*/
  /***************/
  clearResults = () => {
    this.setState({
      mapUrl: "",
      transitTime: {},
      podcasts: [],
    });

    window.scrollTo(0, 0);
  };

  /****************************/
  /* componentDidMount Method */
  /****************************/
  componentDidMount() {
    const auth = firebase.auth();

    // Check to see if the user was already logged in and set the state again
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          loggedIn: true
        });
      }

      // Set the userId state again
      this.setState({
        userId: user.uid,
        loggedIn: true
      })

      // Reference the userId in the database
      const dbRef = firebase.database().ref(this.state.userId);

      // On load/change grab the user's saved list of podcasts and save to state
      dbRef.on('value', (response) => {
        const podArray = [];
        const data = response.val()

        for (let key in data) {
          podArray.push({ key: key, podcasts: data[key] })
        }

        this.setState({
          podcastList: podArray
        })
      })
    })
  }

  /******************/
  /* Render Method */
  /****************/
  render() {
    return (

      <div className="App">
        <div className="wrapper">

          {/* HEADER SECTION COMPONENT */}
          <HeaderSection />

          {/* MENU TO OPEN/CLOSE PODCAST LIST AND LOGIN BUTTON */}
          <button className="menuButton" onClick={this.podcastMenu}><i className="fas fa-bars" aria-label="Button to open login and user podcast menu"></i></button>

          {/* LOGIN AND PODCAST LIST MENU */}
          {this.state.menuOpen && <PodcastMenu key="podcastMenu" loggedIn={this.state.loggedIn} podcastList={this.state.podcastList} logout={this.logout} login={this.login} deletePodcast={this.deletePodcast} />}

          {/* FORM INPUT */}
          <InputForm handleTextChange={this.handleTextChange} handleSubmit={this.handleSubmit} userInputFrom={this.state.userInputFrom} userInputTo={this.state.userInputTo} podcastInput={this.state.podcastInput} />

          {/* SHOW MAP AND TRANSIT TIMES FOR EACH MODE OF TRANSPORTATION */}
          {
            this.state.apiError 
              ? <Error>There was a problem with the API. Please try searching again.</Error>
              : this.state.tooBig 
                ? <Error>The travel distance is too large (more than 320KM). Please try searching for a closer destination.</Error>
                : <div>
                      <MapMode map={this.state.mapUrl} transitTime={this.state.transitTime} />
                      <ul>
                        {
                          this.state.podcasts.map((podcast) => {
                            const { loggedIn, transitTime } = this.state
                            return (
                              <PodcastItem
                                key={podcast.id}
                                image={podcast.image}
                                title={podcast.title_original}
                                length={podcast.audio_length_sec}
                                transitTime={transitTime}
                                savePodcast={this.savePodcast}
                                audio={podcast.audio}
                                id={podcast.id}
                                loggedIn={loggedIn}
                                url={podcast.listennotes_url}
                              />
                            );
                          })
                        }
                      </ul>
                    </div>
          }

          {/* CLEAR THE LIST OF PODCAST RESULTS */}
          {this.state.podcasts.length !== 0 && !this.state.tooBig && <button className="resetButton" onClick={this.clearResults}>Start over</button>}

        </div>
        <footer>Copyright &copy; Alex Calia, Illia Nikitin, Rachel Jiang, Sierra MacDonald | Made at Juno College</footer>
      </div>
    );
  }
}

export default App;