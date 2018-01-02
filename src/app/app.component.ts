import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { FirebaseService } from './shared/firebase-service';
import { LoadingService } from './shared/loading.service';
import { MenuService } from './shared/menu.service';
import { UserReady } from './shared/user/user-notifier';
import { UserService } from './shared/user/user-service';
import { UtilisateurModel } from './shared/user/user.model';

import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('menu') menu: MatSidenav;

  utilisateurCourant: UtilisateurModel;

  isLoading = false;

  constructor(public firebaseService: FirebaseService, public userService: UserService,
              public userReady: UserReady, public toolbarService: MenuService,
              public loadingService: LoadingService) {

  }

  ngOnInit(): void {

    moment.locale('fr');

    this.toolbarService.toggleMenuSource$.subscribe(toggle => {
      this.menu.open()
    });

    this.loadingService.showSource$.subscribe(show => setTimeout(() => this.isLoading = show, 0));

    this.userReady.notifySource$.subscribe(isReady => {
      if (isReady) {
        this.userService.getCurrent()
          .then(currentUser => this.utilisateurCourant = currentUser);
      }
    });
  }
}

