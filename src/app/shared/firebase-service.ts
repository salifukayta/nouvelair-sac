import * as Firebase from 'Firebase';

export class FirebaseService {

  constructor() {
    // Initialize Firebase
    Firebase.initializeApp({
      apiKey: 'AIzaSyAaJjEuweL-BRVXHVPVL1-ETMzeQYdekzY',
      authDomain: 'nouvelair-sac.firebaseapp.com',
      databaseURL: 'https://nouvelair-sac.firebaseio.com',
      projectId: 'nouvelair-sac',
      storageBucket: 'nouvelair-sac.appspot.com',
      messagingSenderId: '718156881715'
    });
  }
}
