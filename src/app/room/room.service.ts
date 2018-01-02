import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

@Injectable()
export class SujetService {

  private refRoomsList: firebase.database.Reference;

  constructor() {
    this.refRoomsList = firebase.database().ref('roomsList');
  }

  add(newRoomName: any) {
    return this.refRoomsList.child(newRoomName).once('value')
      .then(data => {
        if (data.val()) {
          return Promise.reject({name: 'already_exist', message: 'The room name already exist'});
        } else {
          const newRoomCreation = {};
          newRoomCreation['sujets/' + newRoomName] = false;
          newRoomCreation['roomsList/' + newRoomName] = true;
          return firebase.database().ref('/').update(newRoomCreation);
        }
      });
  }

  getAll() {
    return this.refRoomsList.once('value')
      .then(data => {
        const rooms = data.val();
        return rooms ? Object.keys(rooms) : [];
      });

  }

}
