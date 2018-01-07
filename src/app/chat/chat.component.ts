import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { MenuService } from '../shared/menu.service';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';
import { ChatService } from './chat.service';
import { PictureDialog } from './picture-dialog/picture-dialog';
import { ResumeSujetModel } from '../sujet/resume-sujet.model';

// TODO afficher l'état de l'utilisateur => une barre verte si connecté grise si non

// TODO afficher le snackbar que si l'utilisateur a trop de messages

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('scrollingChat') private myScrollContainer: ElementRef;

  sujetCourant: string;
  utilisateurCourant: UtilisateurModel;
  messages: Array<ChatMessage>;
  typedMsg: string;
  nbMsgs: number;

  isPaused = false;
  firstLoad = true;
  loading: boolean = null;

  pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  private snackBarConfig: MatSnackBarConfig;

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar, private dialog: MatDialog,
              private menuService: MenuService, private userService: UserService, private chatService: ChatService) {

    this.typedMsg = '';
    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.loading = true;
    this.isPaused = false;
    this.firstLoad = true;
    this.userService.getCurrent().then(user => this.utilisateurCourant = user);

    // récupération des messages antériux
    this.route.params.subscribe((params: Params) => {
      this.sujetCourant = params['sujet'];
      this.chatService.getDerniersMessages(this.sujetCourant).then(messages => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 5);
        this.loading = null;
      });
      this.subscribeToRoom();
    });

    // get nombre total de messages
    this.chatService.getEvenementResumeMsgs(this.sujetCourant).on('value', (snapshot) => {
      this.nbMsgs = (<ResumeSujetModel>snapshot.val()).nbMsg;
    });
  }

  ngOnDestroy() {
    this.unSubscribeToRoom();
  }

  openMenu() {
    this.menuService.toggle();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  sendMsg() {
    this.chatService.envyer(this.sujetCourant, this.typedMsg.trim())
      .then(() => this.typedMsg = '')
      .catch(err => {
        console.error(err);
        this.snackBar.open(`Erreur envoie message`, '', this.snackBarConfig);
      });
  }

  getMessagesAnterieurs() {
    this.chatService.getMessagesAnterieurs(this.sujetCourant, this.messages[0].id).then(msgsAnterieurs => {
      this.messages = msgsAnterieurs.concat(this.messages);
    });
  }

  /**
   * Not used
   */
  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.unSubscribeToRoom();
    }
    this.isPaused = !this.isPaused;
  }

  openPopupAvaar(avatar: string) {
    this.dialog.open(PictureDialog, { data: avatar });
  }

  private subscribeToRoom() {
    this.chatService.getEvenementDernierMessage(this.sujetCourant).on('value', (snapshot) => {
      if (this.firstLoad) {
        this.firstLoad = false;
      } else {
        const dernierMsg: ChatMessage = this.chatService.getArrayFromSnapshot(snapshot)[0];
        this.chatService.mettreUtilisateur([dernierMsg]);
        this.messages.push(dernierMsg);
        if (dernierMsg.expediteurUid !== this.utilisateurCourant.uid) {
          this.snackBar.open(`Nouveau message reçu...`, `y aller`, this.snackBarConfig)
            .onAction().subscribe(() => this.scrollToBottom());
        }
      }
    });
  }

  private unSubscribeToRoom() {
    this.chatService.getEvenementDernierMessage(this.sujetCourant).off();
  }

  // FIXME afficher le snackbar que si l'utilisateur a trop de messages
  private setStyleScroll() {
    if (this.myScrollContainer.nativeElement.scrollHeight > (this.pageHeight - 128)) {
      this.myScrollContainer.nativeElement.styles.overflowX = 'scroll';
    }
  }

}

