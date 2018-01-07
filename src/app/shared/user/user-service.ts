import { Injectable } from '@angular/core';
import * as Firebase from 'Firebase';
import 'rxjs/add/operator/map';
import { UserReady } from './user-notifier';
import { UtilisateurModel } from './user.model';

@Injectable()
export class UserService {

  private refDatabaseUsers: Firebase.database.Reference;
  private refStorageUsers: Firebase.storage.Reference;

  private currentUser: UtilisateurModel;

  constructor(public userReady: UserReady) {
    this.refDatabaseUsers = Firebase.database().ref('users');
    this.refStorageUsers = Firebase.storage().ref('users');
  }

  getCurrent(): Promise<UtilisateurModel> {
    if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) =>
        Firebase.auth().onAuthStateChanged(resolve, reject)).then((user: Firebase.User) => {
        return this.getUtilisateur(user.uid).then(snapshot => {
          this.currentUser = snapshot.val();
          this.userReady.notify(true);
          return this.currentUser;
        });
      });
    }
  }

  login(userModel: UtilisateurModel, password: string) {
    return Firebase.auth().signInWithEmailAndPassword(userModel.email, password)
      .then(() => {
        return this.getCurrent().then(user => {
          // since I can connect from multiple devices or browser tabs, we store each connection instance separately
          // any time that connectionsRef's value is null (i.e. has no children) I am offline
          const myConnectionsRef = Firebase.database().ref('users/' + user.uid + '/connections');

          // stores the timestamp of my last disconnect (the last time I was seen online)
          const lastOnlineRef = Firebase.database().ref('users/' + user.uid + '/lastOnline');

          const connectedRef = Firebase.database().ref('.info/connected');
          connectedRef.on('value', function (snap) {
            if (snap.val() === true) {
              // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
              const con = myConnectionsRef.push();

              // When I disconnect, remove this device
              con.onDisconnect().remove();

              // Add this device to my connections list
              // this value could contain info about the device or a timestamp too
              con.set(true);

              // When I disconnect, update the last time I was seen online
              lastOnlineRef.onDisconnect().set(Firebase.database.ServerValue.TIMESTAMP);
            }
          });
        });
        // return this.getCurrent().then(user => {
        //   return this.updateUserInfo(user);
        // });
      });
  }

  create(userModel: UtilisateurModel, password: string) {
    return Firebase.auth().createUserWithEmailAndPassword(userModel.email, password)
      .then(() => {
        userModel.uid = Firebase.auth().currentUser.uid;
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
      Firebase.auth().onAuthStateChanged(resolve, reject)).then((user: Firebase.User) => {
      this.userReady.notify(Boolean(user));
      return Boolean(user);
    });
  }

  logOut() {
    this.currentUser = undefined;
    Firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return Firebase.auth().currentUser.updatePassword(newPassword);
  }

  updateUser(user: UtilisateurModel, userAvatar: string) {
    // Upload the avatar only if it was changed
    if (userAvatar.startsWith('data')) {
      return this.refStorageUsers.child(user.uid)
        .putString(userAvatar.substring(userAvatar.indexOf(',') + 1), Firebase.storage.StringFormat.BASE64)
        .then((fileSnapshot: Firebase.storage.UploadTaskSnapshot) => {
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
   * @returns {Firebase.Promise<any>}
   */
  updateUserInfo(user: UtilisateurModel) {
    return this.refDatabaseUsers.child(user.uid).update(user)
      .then(() => this.currentUser = user);
  }

  /**
   * Send email to the utilisateur to reset his password
   *
   * @param user
   * @returns {Firebase.Promise<any>}
   */
  resetPassword(user: UtilisateurModel) {
    return Firebase.auth().sendPasswordResetEmail(user.email);
  }

  /**
   * Update utilisateur auth email if changed then utilisateur info
   *
   * @param user
   * @returns {Firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UtilisateurModel) {
    if (Firebase.auth().currentUser.email !== user.email) {
      return Firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }

  getUtilisateur(utilisateurUid: string) {
    return this.refDatabaseUsers.child(utilisateurUid).once('value');
  }
}
