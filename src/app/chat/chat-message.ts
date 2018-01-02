import { UtilisateurModel } from '../shared/user/user.model';

export class ChatMessage {

  private _expediteur: UtilisateurModel;
  private _content: string;
  private _timestamp: number;

  constructor() {
    this._expediteur = new UtilisateurModel();
    this._content = '';
    this._timestamp = 0;
  }

  get expediteur(): UtilisateurModel {
    return this._expediteur;
  }

  set expediteur(value: UtilisateurModel) {
    this._expediteur = value;
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
