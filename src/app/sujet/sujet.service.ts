import { Injectable } from '@angular/core';
import * as Firebase from 'Firebase';
import 'rxjs/add/operator/map';
import { ResumeSujetModel } from './resume-sujet.model';

@Injectable()
export class SujetService {

  private refNomSujet: Firebase.database.Reference;
  private refBase: Firebase.database.Reference;

  constructor() {
    this.refNomSujet = Firebase.database().ref('nomSujets');
    this.refBase = Firebase.database().ref('/');
  }

  add(nouveauNomSujet: any) {
    return this.refNomSujet.child(nouveauNomSujet).once('value')
      .then(data => {
        if (data.val()) {
          return Promise.reject({ name: 'already_exist', message: 'Le nom de sujet existe dèjà' });
        } else {
          const newRoomCreation = {};
          newRoomCreation['resumesSujet/' + nouveauNomSujet] = false;
          newRoomCreation['nomSujets/' + nouveauNomSujet] = <ResumeSujetModel>{
            nomSujet: nouveauNomSujet,
            nbMsg: 0,
            lastMsgTime: new Date().getTime()
          };
          return this.refBase.update(newRoomCreation);
        }
      });
  }

  getAll(): Promise<Array<ResumeSujetModel>> {
    // TODO gèrer plus de 100 sujets
    return this.refNomSujet.once('value')
      .then(data => {
        const resumesSujet = data.val();
        return Object.keys(resumesSujet ? resumesSujet : []).map(key => resumesSujet[key])
          .sort((rS1: ResumeSujetModel, rS2: ResumeSujetModel) => rS2.lastMsgTime - rS1.lastMsgTime);
      });

  }

}
