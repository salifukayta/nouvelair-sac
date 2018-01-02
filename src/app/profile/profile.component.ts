import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { GlobalValidator } from '../shared/global.validator';
import { LoadingService } from '../shared/loading.service';
import { MenuService } from '../shared/menu.service';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ValidationMessageService } from '../shared/validation-message.service';
import { ChangePasswordDialog } from './change-pssword/change-password.dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  utilisateur = new UtilisateurModel();
  userAvatar: string;
  editMode = false;
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

  constructor(private dialog: MatDialog, private loadingService: LoadingService, private userService: UserService,
              private messageService: ValidationMessageService, private formBuilder: FormBuilder, private menuService: MenuService,
              private snackBar: MatSnackBar) {

    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.buildProfileForm(true);
  }

  ngOnInit() {
    this.editMode = false;

    this.loadingService.show(true);
    this.isLoadingAvatar = true;
    this.userService.getCurrent().then(user => {
      this.utilisateur = user;
      this.userAvatar = user.avatar;
      this.loadingService.show(false);
      this.isLoadingAvatar = false;
    }).catch(err => {
      this.loadingService.show(false);
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
      const photoAUploade = event.srcElement.files[0];
      const reader = new FileReader();
      const that = this;
      reader.onload = function (e: any) {

        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
          const maxWidth = 128;
          const maxHeight = 128;
          let imageWidth = image.width;
          let imageHeight = image.height;


          if (imageWidth > imageHeight) {
            if (imageWidth > maxWidth) {
              imageHeight *= maxWidth / imageWidth;
              imageWidth = maxWidth;
            }
          } else {
            if (imageHeight > maxHeight) {
              imageWidth *= maxHeight / imageHeight;
              imageHeight = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          image.width = imageWidth;
          image.height = imageHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(<any>this, 0, 0, imageWidth, imageHeight);

          that.userAvatar = canvas.toDataURL(photoAUploade.type);
        }
      };
      reader.readAsDataURL(photoAUploade);
    } else {
      this.snackBar.open(`Erreur lors de la récupération de la photo`, '', this.snackBarConfig);
    }
  }

  // TODO fix picture orientation on mobile phone
  // https://stackoverflow.com/questions/20600800/js-client-side-exif-orientation-rotate-and-mirror-jpeg-images
  // https://github.com/blueimp/JavaScript-Load-Image
  
  // private getOrientation(file, callback) {
  //   var reader = new FileReader();
  //
  //   reader.onload = function (event: any) {
  //     var view = new DataView(event.target.result);
  //
  //     if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
  //
  //     var length = view.byteLength,
  //       offset = 2;
  //
  //     while (offset < length) {
  //       var marker = view.getUint16(offset, false);
  //       offset += 2;
  //
  //       if (marker == 0xFFE1) {
  //         if (view.getUint32(offset += 2, false) != 0x45786966) {
  //           return callback(-1);
  //         }
  //         var little = view.getUint16(offset += 6, false) == 0x4949;
  //         offset += view.getUint32(offset + 4, little);
  //         var tags = view.getUint16(offset, little);
  //         offset += 2;
  //
  //         for (var i = 0; i < tags; i++)
  //           if (view.getUint16(offset + (i * 12), little) == 0x0112)
  //             return callback(view.getUint16(offset + (i * 12) + 8, little));
  //       }
  //       else if ((marker & 0xFF00) != 0xFF00) break;
  //       else offset += view.getUint16(offset, false);
  //     }
  //     return callback(-1);
  //   };
  //
  //   reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  // }
  //
  // private resetOrientation(srcBase64, srcOrientation, callback) {
  //   var img = new Image();
  //
  //   img.onload = function () {
  //     var width = img.width,
  //       height = img.height,
  //       canvas = document.createElement('canvas'),
  //       ctx = canvas.getContext("2d");
  //
  //     // set proper canvas dimensions before transform & export
  //     if (4 < srcOrientation && srcOrientation < 9) {
  //       canvas.width = height;
  //       canvas.height = width;
  //     } else {
  //       canvas.width = width;
  //       canvas.height = height;
  //     }
  //
  //     // transform context before drawing image
  //     switch (srcOrientation) {
  //       case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
  //       case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
  //       case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
  //       case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
  //       case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
  //       case 7: ctx.transform(0, -1, -1, 0, height, width); break;
  //       case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
  //       default: break;
  //     }
  //
  //     // draw image
  //     ctx.drawImage(img, 0, 0);
  //
  //     // export base64
  //     callback(canvas.toDataURL());
  //   };
  //
  //   img.src = srcBase64;
  // }

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
    this.loadingService.show(true);
    this.userService.updateUser(this.utilisateur, this.userAvatar)
      .then(() => {
        this.editMode = false;
        this.buildProfileForm(true);
        this.loadingService.show(false);
        this.snackBar.open(`Mise à jour de votre profil réussit`, '', this.snackBarConfig);
      })
      .catch(err => {
        this.editMode = false;
        this.loadingService.show(false);
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
