import { UtilisateurModel } from '../shared/user/user.model';

export class ChatMessage {

  private _id: string;
  private _expediteurUid: string;
  private _expediteur: UtilisateurModel;
  private _content: string;
  private _timestamp: number;

  constructor() {
    this._expediteur = new UtilisateurModel();
    this._content = '';
    this._timestamp = 0;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get expediteur(): UtilisateurModel {
    return this._expediteur;
  }

  set expediteur(value: UtilisateurModel) {
    this._expediteur = value;
  }
  get expediteurUid(): string {
    return this._expediteurUid;
  }

  set expediteurUid(value: string) {
    this._expediteurUid = value;
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get timestamp(): number {
    return this._timestamp;
  }

  set timestamp(value: number) {
    this._timestamp = value;
  }

}
