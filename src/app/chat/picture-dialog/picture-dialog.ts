import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-picture-dialog',
  templateUrl: './picture-dialog.html',
  styleUrls: ['./picture-dialog.css']
})
export class PictureDialog {

  avatar: string;

  constructor(private dialogRef: MatDialogRef<PictureDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
    this.avatar = data;
  }

  close(): void {
    this.dialogRef.close();
  }
}
