
export class UtilisateurModel {

  uid: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string;
  batiment: string;
  numApp: string;
  estResponsable: boolean;

  constructor() {
    this.uid = '';
    this.nom = '';
    this.prenom = '';
    this.email = '';
    this.batiment = '';
    this.numApp = '';
    this.avatar = 'default_avatar.png';
    this.estResponsable = false;
  }
}
