import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-message',
  templateUrl: './confirm-message.dialog.html',
  styleUrls: ['./confirm-message.dialog.css']
})
export class ConfirmMessageDialog {

  title: string;
  content: string;

  constructor(public dialogRef: MatDialogRef<ConfirmMessageDialog>) { }

}
