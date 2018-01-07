import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { GlobalValidator } from '../shared/global.validator';
import { MenuService } from '../shared/menu.service';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ValidationMessageService } from '../shared/validation-message.service';
import { ChangePasswordDialog } from './change-pssword/change-password.dialog';
import { UserReady } from '../shared/user/user-notifier';

declare var loadImage: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  utilisateur = new UtilisateurModel();
  userAvatar: string;

  editMode = false;
  loading: boolean = null;
  isLoadingAvatar = false;

  profileForm: FormGroup;
  formErrors = {
    email: '',
    nom: '',
    prenom: '',
    avatar: '',
    batiment: '',
    numApp: ''
  };
  private snackBarConfig: MatSnackBarConfig;

  constructor(private dialog: MatDialog, private userService: UserService,
              private messageService: ValidationMessageService, private formBuilder: FormBuilder, private menuService: MenuService,
              private snackBar: MatSnackBar, private userReady: UserReady) {

    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.buildProfileForm(true);
  }

  ngOnInit() {
    this.editMode = false;

    this.loading = true;
    this.isLoadingAvatar = true;
    this.userService.getCurrent().then(user => {
      this.utilisateur = user;
      this.userAvatar = user.avatar;
      this.loading = null;
      this.isLoadingAvatar = false;
    }).catch(err => {
      this.loading = null;
      this.isLoadingAvatar = false;
      console.error(err);
      this.snackBar.open(`Erreur lors de récupération de votre profil`, '', this.snackBarConfig);
    });
  }

  openMenu() {
    this.menuService.toggle();
  }

  editItems(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!this.editMode);
  }

  changeAvatar(event) {
    if (event.srcElement.files && event.srcElement.files[0]) {
      const that = this;
      const loadingImage = loadImage(
        event.target.files[0],
        function (img) {
          that.userAvatar = img.toDataURL(event.target.files[0].type);
        },
        {maxWidth: 600, orientation: true}
      );
    }
  }

  changePassword() {
    this.dialog.open(ChangePasswordDialog, <MatDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe(newPassword => {
      if (newPassword) {
        this.userService.updatePassword(newPassword)
          .then(() => {
            this.snackBar.open(`Mot de passe mis à jour`, '', this.snackBarConfig);
          })
          .catch(err => {
            console.error(err);
            this.snackBar.open(`Erreur lors de la mise à jour du mot de passe`, '', this.snackBarConfig);
          });
      }
    });
  }

  save() {
    this.utilisateur.email = this.profileForm.value.email;
    this.utilisateur.nom = this.profileForm.value.nom;
    this.utilisateur.prenom = this.profileForm.value.prenom;
    this.utilisateur.batiment = this.profileForm.value.batiment;
    this.utilisateur.avatar = this.userAvatar;
    this.loading = true;
    this.userService.updateUser(this.utilisateur, this.userAvatar)
      .then(() => {
        this.editMode = false;
        this.buildProfileForm(true);
        this.loading = null;
        this.userReady.notify(true);
        this.snackBar.open(`Mise à jour de votre profil réussit`, '', this.snackBarConfig);
      })
      .catch(err => {
        this.editMode = false;
        this.loading = null;
        console.error(err);
        this.snackBar.open(`Erreur lors de la mise à jour de votre profil`, '', this.snackBarConfig);
      });
  }

  private buildProfileForm(disabled: boolean) {
    this.userAvatar = this.utilisateur.avatar;
    this.profileForm = this.formBuilder.group({
      nom: [{ value: this.utilisateur.nom, disabled: disabled }, Validators.required],
      prenom: [{ value: this.utilisateur.prenom, disabled: disabled }, Validators.required],
      email: [{ value: this.utilisateur.email, disabled: disabled },
        Validators.compose([Validators.required, GlobalValidator.mailFormat])],
      batiment: [{ value: this.utilisateur.batiment, disabled: disabled }, Validators.required],
      numApp: [{ value: this.utilisateur.numApp, disabled: disabled }, Validators.required]
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
  }
}
