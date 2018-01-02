import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GlobalValidator } from '../../shared/global.validator';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidationMessageService } from '../../shared/validation-message.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.dialog.html',
  styleUrls: ['./change-password.dialog.css']
})
export class ChangePasswordDialog implements OnInit, OnDestroy {

  passwordForm: FormGroup;
  newPassword: string;
  confirmNewPassword: string;
  formErrors = {
    'password': '',
    'confirmPassword': ''
  };

  constructor(public messageService: ValidationMessageService, public dialogRef: MatDialogRef<ChangePasswordDialog>,
              public formBuilder: FormBuilder) {

    this.passwordForm = formBuilder.group({
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.passwordForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.passwordForm, this.formErrors));
    this.messageService.onValueChanged(this.passwordForm, this.formErrors);
  }

  ngOnInit() {
    GlobalValidator.samePassword(this.passwordForm, 'changePassword');
  }

  ngOnDestroy() {
    GlobalValidator.endSamePassword(this.passwordForm, 'changePassword');
  }

  cancel() {
    this.dialogRef.close(false);
  }

  save() {
    this.dialogRef.close(this.newPassword);
  }

}
