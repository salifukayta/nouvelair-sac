import { Injectable } from '@angular/core';
import * as Firebase from 'Firebase';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';
import { ResumeSujetModel } from '../sujet/resume-sujet.model';

@Injectable()
export class ChatService {

  public static numberLastMessage = 5;

  private refSujet: Firebase.database.Reference;
  private refNomSujet: Firebase.database.Reference;

  private utilisateurs: {[userUid: string]: UtilisateurModel};

  constructor(private userService: UserService) {
    this.refSujet = Firebase.database().ref('/resumesSujet');
    this.refNomSujet = Firebase.database().ref('nomSujets');
    this.utilisateurs = <any>{};
    this.userService.getCurrent().then((user: UtilisateurModel) => this.utilisateurs[user.uid] = user);
  }

  getDerniersMessages(nomSujet: string): Promise<Array<ChatMessage>> {
    return this.refSujet.child(nomSujet).limitToLast(ChatService.numberLastMessage).once('value').then(snapshot => {
      const msgs = this.getArrayFromSnapshot(snapshot);
      this.mettreUtilisateur(msgs);
      return msgs;
    });
  }

  getMessagesAnterieurs(nomSujet: string, dernierKey: string): Promise<Array<ChatMessage>> {
    return this.refSujet.child(nomSujet).orderByKey().endAt(dernierKey).limitToLast(ChatService.numberLastMessage + 1)
      .once('value').then(snapshot => {
        const msgs = this.getArrayFromSnapshot(snapshot);
        msgs.pop();
        this.mettreUtilisateur(msgs);
        return msgs;
      });
  }

  getEvenementDernierMessage(nomSujet: string) {
    return this.refSujet.child(nomSujet).limitToLast(1);
  }

  getEvenementResumeMsgs(nomSujet: string) {
    return this.refNomSujet.child(nomSujet);
  }

  envyer(nomSujet: string, typedMsg: string) {
    return this.userService.getCurrent().then((user: UtilisateurModel) => {
      const msgId = this.refSujet.child(nomSujet).push().key;
      return this.refSujet.child(nomSujet).child(msgId).update({
        id: msgId,
        expediteurUid: user.uid,
        content: typedMsg,
        timestamp: new Date().getTime()
      }).then(() =>
        this.refNomSujet.child(nomSujet).transaction((resumeSujetModel: ResumeSujetModel) => {
          if (resumeSujetModel.nbMsg || resumeSujetModel.nbMsg === 0) {
            resumeSujetModel.nbMsg++;
            resumeSujetModel.lastMsgTime = new Date().getTime();
          }
          return resumeSujetModel;
        })
      );
    });
  }

  sAbonnerAuSujet(nomSujet: string): Promise<Array<ChatMessage>> {
    return new Promise((resolve, reject) => this.refSujet.child(nomSujet)
      .limitToLast(ChatService.numberLastMessage).on('value', resolve, reject))
      .then((snapshot: Firebase.database.DataSnapshot) => {
        const msgs = this.getArrayFromSnapshot(snapshot);
        this.mettreUtilisateur(msgs);
        return msgs;
      });
  }

  seDesabonnerAuSujet(nomSujet: string) {
    this.refSujet.child(nomSujet).limitToLast(ChatService.numberLastMessage).off();
  }

  getArrayFromSnapshot(snapshotMessages) {
    const chatMessages = snapshotMessages.val();
    return Object.keys(chatMessages ? chatMessages : []).map(key => chatMessages[key]);
  }

  mettreUtilisateur(msgs: Array<ChatMessage>): void {
    for (const msg of msgs) {
      if (this.utilisateurs[msg.expediteurUid]) {
        msg.expediteur = this.utilisateurs[msg.expediteurUid];
      } else {
        this.userService.getUtilisateur(msg.expediteurUid).then(userSnapshot => {
          msg.expediteur = userSnapshot.val()
        });
      }
    }
  }

}

