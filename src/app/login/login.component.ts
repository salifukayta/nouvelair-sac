import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UtilisateurModel } from '../shared/user/user.model';
import { UserService } from '../shared/user/user-service';
import { GlobalValidator } from '../shared/global.validator';
import { ValidationMessageService } from '../shared/validation-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  utilisateur = new UtilisateurModel();
  password: string;
  confirmPassword: string;
  userAvatar: string;

  isOnLogin = true;
  loading: boolean = null;

  loginForm: FormGroup;
  formErrors = {
    email: '',
    nom: '',
    prenom: '',
    avatar: '',
    batiment: '',
    numApp: '',
    password: '',
    confirmPassword: ''
  };

  private snackBarConfig: MatSnackBarConfig;

  constructor(private userService: UserService, private messageService: ValidationMessageService,
              private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar) {

    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.utilisateur = new UtilisateurModel();
    this.buildProfileForm();

    if (this.router.url.indexOf('disconnect') !== -1) {
      this.userService.logOut();
    } else {
      this.userService.isAuth()
        .then(isAuth => {
          if (isAuth) {
            this.router.navigate(['sujet']);
          } else {
          }
        });
    }
  }

  private buildProfileForm() {
    this.loginForm = this.formBuilder.group({
      nom: [{ value: this.utilisateur.nom }, Validators.required],
      prenom: [{ value: this.utilisateur.prenom }, Validators.required],
      email: [{ value: this.utilisateur.email },
        Validators.compose([Validators.required, GlobalValidator.mailFormat])],
      batiment: [{ value: this.utilisateur.batiment }, Validators.required],
      numApp: [{ value: this.utilisateur.numApp }, Validators.required],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.loginForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.loginForm, this.formErrors));
    this.messageService.onValueChanged(this.loginForm, this.formErrors);
  }

  changeAvatar(event) {
    if (event.srcElement.files && event.srcElement.files[0]) {
      const reader = new FileReader();
      const that = this;
      reader.onload = function (e: any) {
        that.userAvatar = e.target.result;
      };
      reader.readAsDataURL(event.srcElement.files[0]);
    } else {
      this.snackBar.open(`Erreur lors de la récupération de la photo`, '', this.snackBarConfig);
    }
  }

  login() {
    if (this.isOnLogin) {
      this.loading = true;
      this.userService.login(this.utilisateur, this.password)
        .then(() => {
          this.loading = null;
          this.router.navigate(['sujet']);
          this.snackBar.open(`Authentification réussit`, '', this.snackBarConfig);
        })
        .catch((err: any) => {
          this.loading = null;
          console.error(err);
          let errMsg = 'Erreur Authentification';
          switch (err.code) {
            case 'auth/invalid-email':
            case 'auth/utilisateur-not-found':
            case 'auth/wrong-password':
              errMsg = `Incorrect Email or Mot de passe`;
              break;
          }
          this.snackBar.open(errMsg, '', this.snackBarConfig);
        });
    } else {
      this.isOnLogin = true;
      GlobalValidator.endSamePassword(this.loginForm, 'login');
    }
  }

  signUp() {
    if (this.isOnLogin) {
      this.isOnLogin = false;
      setTimeout(GlobalValidator.samePassword(this.loginForm, 'login'), 2000);
    } else {
      this.loading = true;
      this.utilisateur.avatar = this.userAvatar;
      this.userService.create(this.utilisateur, this.password)
        .then(() => {
          this.loading = null;
          this.router.navigate(['sujet']);
          this.snackBar.open(`Création de compte réussit`, '', this.snackBarConfig);
        })
        .catch((err: any) => {
          this.loading = null;
          console.error(err);
          let errMsg = `Erreur lors de Création de compte`;
          switch (err.code) {
            case 'auth/email-already-in-use':
              errMsg = err.message;
              break;
            case 'auth/network-request-failed':
              errMsg = `Pas de connection internet`;
              break;
          }
          this.snackBar.open(errMsg, '', this.snackBarConfig);
        });
    }
  }

  resetPassword() {
    this.userService.resetPassword(this.utilisateur).then(() => {
      this.snackBar.open(`Email pour resetter le mot de passe envoyé`, '', this.snackBarConfig);
    }, (err) => {
      console.error(err);
      this.snackBar.open(`Erreur, veuillez contacte l'admin`, '', this.snackBarConfig);
    });
  }

}

