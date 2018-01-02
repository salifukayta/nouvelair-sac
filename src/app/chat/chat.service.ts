import { Injectable } from '@angular/core';
import * as Firebase from 'Firebase';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';

@Injectable()
export class ChatService {

  private numberLastMessage = 100;
  private refRooms: Firebase.database.Reference;

  constructor(private userService: UserService) {
    this.refRooms = Firebase.database().ref('sujets');
  }

  getLastMessagess(roomName: string): Promise<Array<ChatMessage>> {
    return this.refRooms.child(roomName).limitToLast(this.numberLastMessage).once('value').then(snapshot => {
      const chatMessages: ChatMessage = snapshot.val();
      return Object.keys(chatMessages ? chatMessages : []).map(key => chatMessages[key]);
    });
  }

  getLastEvent(roomName: string) {
    return this.refRooms.child(roomName).limitToLast(1);
  }

  send(roomName: string, typedMsg: string) {
    return this.userService.getCurrent()
      .then((user: UtilisateurModel) => {
        return this.refRooms.child(roomName).push({
          expediteur: user,
          content: typedMsg,
          timestamp: new Date().getTime()
        });
      });
  }

  subscribeRoomMessage(roomName: string): Promise<Array<ChatMessage>> {
    return new Promise((resolve, reject) => this.refRooms.child(roomName)
      .limitToLast(this.numberLastMessage).on('value', resolve, reject))
      .then((snapshot: Firebase.database.DataSnapshot) => {
        const chatMessages = snapshot.val();
        return Object.keys(chatMessages ? chatMessages : [])
          .map(key => chatMessages[key]);
      });
  }

  unSubscribeRoomMessage(roomName: string) {
    this.refRooms.child(roomName)
      .limitToLast(this.numberLastMessage).off();
  }
}
