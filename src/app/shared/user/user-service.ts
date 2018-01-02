import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import 'rxjs/add/operator/map';
import { UserReady } from './user-notifier';
import { UtilisateurModel } from './user.model';

@Injectable()
export class UserService {

  private refDatabaseUsers: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UtilisateurModel;

  constructor(public userReady: UserReady) {
    this.refDatabaseUsers = firebase.database().ref('users');
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getCurrent(): Promise<UtilisateurModel> {
    if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) =>
        firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
        return this.refDatabaseUsers.child(user.uid).once('value')
          .then(snapshot => {
            this.currentUser = snapshot.val();
            this.userReady.notify(true);
            return this.currentUser;
          });
      });
    }
  }

  login(userModel: UtilisateurModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password)
      .then(() => {
        return this.getCurrent().then(user => {
          return this.updateUserInfo(user);
        });
      });
  }

  create(userModel: UtilisateurModel, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(userModel.email, password)
      .then(() => {
        userModel.uid = firebase.auth().currentUser.uid;
        return this.refDatabaseUsers.child(userModel.uid).set(userModel).then(() =>
          this.updateUser(userModel, userModel.avatar).then(() => {
            this.currentUser = userModel;
            this.userReady.notify(true);
          })
        );
      });
  }

  isAuth(): Promise<boolean> {
    return this.currentUser ? Promise.resolve(true) : new Promise((resolve, reject) =>
      firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
      this.userReady.notify(Boolean(user));
      return Boolean(user);
    });
  }

  logOut() {
    this.currentUser = undefined;
    firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  updateUser(user: UtilisateurModel, userAvatar: string) {
    // Upload the avatar only if it was changed
    if (userAvatar.startsWith('data')) {
      return this.refStorageUsers.child(user.uid)
        .putString(userAvatar.substring(userAvatar.indexOf(',') + 1), firebase.storage.StringFormat.BASE64)
        .then((fileSnapshot: firebase.storage.UploadTaskSnapshot) => {
          user.avatar = fileSnapshot.downloadURL;
          return this.updateUserAuthEmail(user);
        });
    } else {
      return this.updateUserAuthEmail(user);
    }
  }

  /**
   * Update the utilisateur informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UtilisateurModel) {
    return this.refDatabaseUsers.child(user.uid).update(user)
      .then(() => this.currentUser = user);
  }

  /**
   * Send email to the utilisateur to reset his password
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  resetPassword(user: UtilisateurModel) {
    return firebase.auth().sendPasswordResetEmail(user.email);
  }

  /**
   * Update utilisateur auth email if changed then utilisateur info
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UtilisateurModel) {
    if (firebase.auth().currentUser.email !== user.email) {
      return firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }

}
