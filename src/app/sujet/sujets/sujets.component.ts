import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../shared/menu.service';
import { LoadingService } from '../../shared/loading.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SujetService } from '../sujet.service';
import { Router } from '@angular/router';
import { AjouterSujetDialog } from '../ajout-sujet/ajout-sujet.dialog';

@Component({
  selector: 'app-room',
  templateUrl: './sujets.component.html',
  styleUrls: ['./sujets.component.css']
})
export class RoomComponent implements OnInit {

  private snackBarConfig: MatSnackBarConfig;

  firstLoad = true;
  sujets: Array<string>;

  constructor(private sujetService: SujetService, private loadingService: LoadingService, private router: Router,
              private snackBar: MatSnackBar, private dialog: MatDialog, private menuService: MenuService) {

    this.sujets = new Array();
    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.firstLoad = true;
    this.loadingService.show(true);
    this.sujetService.getAll()
      .then(sujets => {
        this.sujets = sujets;
        this.loadingService.show(false);
        this.firstLoad = false;
      })
      .catch(err => {
        this.loadingService.show(false);
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
        this.loadingService.show(true);
        this.sujetService.add(nomSujet).then(() => {
            this.loadingService.show(false);
            this.router.navigate([nomSujet, 'chat']);
            this.snackBar.open(`Création de Sujet réussit`, '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
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
