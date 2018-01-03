import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule,
  // MatAutocompleteModule,
  // MatButtonToggleModule,
  // MatCardModule,
  // MatCheckboxModule,
  // MatChipsModule,
  // MatDatepickerModule,
  // MatExpansionModule,
  // MatGridListModule,
  // MatMenuModule,
  // MatNativeDateModule,
  // MatProgressBarModule,
  // MatRadioModule,
  // MatRippleModule,
  // MatSliderModule,
  // MatStepperModule,
  // MatTableModule,
  // MatTabsModule,
  MatTooltipModule
} from '@angular/material';

import 'hammerjs';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { ChatService } from './chat/chat.service';
import { ConfirmMessageDialog } from './confirm-message/confirm-message.dialog';
import { LoginComponent } from './login/login.component';
import { ChangePasswordDialog } from './profile/change-pssword/change-password.dialog';
import { ProfileComponent } from './profile/profile.component';
import { CanActivateViaAuthGuard } from './shared/can-activate-via-auth.guard';
import { FirebaseService } from './shared/firebase-service';
import { LoadingService } from './shared/loading.service';
import { MenuService } from './shared/menu.service';
import { TextFromCamelCasePipe } from './shared/text-from-camel-case.pipe/text-from-camel-case.pipe';
import { UserReady } from './shared/user/user-notifier';
import { UserService } from './shared/user/user-service';
import { ValidationMessageService } from './shared/validation-message.service';
import { MomentModule } from 'angular2-moment';
import { PictureDialog } from './chat/picture-dialog/picture-dialog';
import { RoomComponent } from './sujet/sujets/sujets.component';
import { AjouterSujetDialog } from './sujet/ajout-sujet/ajout-sujet.dialog';
import { SujetService } from './sujet/sujet.service';


const appRoutes: Routes = [
  { path: 'login/disconnect', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sujet', component: RoomComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'sujet/:sujet', component: ChatComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: '', component: LoginComponent, canActivate: [CanActivateViaAuthGuard] },
  { path: '**', component: LoginComponent, canActivate: [CanActivateViaAuthGuard] }
];

const localStorageServiceConfig = {
  prefix: 'nuualamak',
  storageType: 'sessionStorage'
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RoomComponent,
    ChatComponent,
    ProfileComponent,
    ChangePasswordDialog,
    AjouterSujetDialog,
    ConfirmMessageDialog,
    PictureDialog,
    TextFromCamelCasePipe
  ],
  entryComponents: [
    ChangePasswordDialog,
    AjouterSujetDialog,
    ConfirmMessageDialog,
    PictureDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    MomentModule,

    FlexLayoutModule,

    // MATERIAL
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // CDK
    A11yModule,
    BidiModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    ScrollDispatchModule,
    CdkStepperModule,
    CdkTableModule,
  ],
  providers: [
    UserService,
    FirebaseService,
    MenuService,
    LoadingService,
    SujetService,
    ChatService,
    UserReady,
    ValidationMessageService,
    CanActivateViaAuthGuard,
    { provide: 'LOCAL_STORAGE_SERVICE_CONFIG', useValue: localStorageServiceConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}

