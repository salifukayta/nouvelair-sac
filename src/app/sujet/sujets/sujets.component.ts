import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../shared/menu.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SujetService } from '../sujet.service';
import { Router } from '@angular/router';
import { AjouterSujetDialog } from '../ajout-sujet/ajout-sujet.dialog';
import { ResumeSujetModel } from '../resume-sujet.model';

@Component({
  selector: 'app-sujet',
  templateUrl: './sujets.component.html',
  styleUrls: ['./sujets.component.css']
})
export class SujetComponent implements OnInit {

  private snackBarConfig: MatSnackBarConfig;

  resumesSujet: Array<ResumeSujetModel>;
  firstLoad = true;
  loading: boolean = null;

  constructor(private sujetService: SujetService, private router: Router,
              private snackBar: MatSnackBar, private dialog: MatDialog, private menuService: MenuService) {

    this.resumesSujet = new Array();
    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.firstLoad = true;
    this.loading = true;
    this.sujetService.getAll()
      .then(sujets => {
        this.resumesSujet = sujets;
        this.loading = null;
        this.firstLoad = false;
      })
      .catch(err => {
        this.loading = null;
        this.firstLoad = false;
        this.snackBar.open(`Erreur lors du chargement de la liste des sujets`, '', this.snackBarConfig);
      });
  }

  openMenu() {
    this.menuService.toggle();
  }

  ajouterSujet() {
    this.dialog.open(AjouterSujetDialog, <MatDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe(nomSujet => {
      if (nomSujet) {
        this.loading = true;
        this.sujetService.add(nomSujet).then(() => {
            this.loading = null;
            this.router.navigate([nomSujet, 'chat']);
            this.snackBar.open(`Création de Sujet réussit`, '', this.snackBarConfig);
          })
          .catch(err => {
            this.loading = null;
            if (err.name === 'already_exist') {
              this.snackBar.open(err.message, '', this.snackBarConfig);
            } else {
              this.snackBar.open(`Erreur lors de la Création de Sujet`, '', this.snackBarConfig);
            }
          });
      }
    });
  }
}
