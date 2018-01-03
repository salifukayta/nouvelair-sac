import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as Firebase from 'Firebase';

@Injectable()
export class SujetService {

  private refNomSujet: Firebase.database.Reference;
  private refBase: Firebase.database.Reference;

  constructor() {
    this.refNomSujet = Firebase.database().ref('nomSujets');
    this.refBase = Firebase.database().ref('/');
  }

  add(newRoomName: any) {
    return this.refNomSujet.child(newRoomName).once('value')
      .then(data => {
        if (data.val()) {
          return Promise.reject({name: 'already_exist', message: 'Le nom de sujet existe dèjà'});
        } else {
          const newRoomCreation = {};
          newRoomCreation['sujets/' + newRoomName] = false;
          newRoomCreation['nomSujets/' + newRoomName] = 0;
          return this.refBase.update(newRoomCreation);
        }
      });
  }

  getAll() {
    // TODO gèrer plus de 100 sujets
    return this.refNomSujet.once('value')
      .then(data => {
        const nomSujets = data.val();
        return nomSujets ? Object.keys(nomSujets) : [];
      });

  }

}
