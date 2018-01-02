import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidationMessageService } from '../../shared/validation-message.service';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.dialogt.html',
  styleUrls: ['./add-room.dialog.css']
})
export class AjouterSujetDialog {

  nouveauSujet = '';
  ajoutSujetForm: FormGroup;
  formErrors = {
    'nomSujet': '',
  };

  constructor(public dialogRef: MatDialogRef<AjouterSujetDialog>, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder) {

    this.ajoutSujetForm = formBuilder.group({
      nomSujet: ['', Validators.required]
    });
    this.ajoutSujetForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.ajoutSujetForm, this.formErrors));
    this.messageService.onValueChanged(this.ajoutSujetForm, this.formErrors);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  add() {
    this.dialogRef.close(this.nouveauSujet);
  }

}

