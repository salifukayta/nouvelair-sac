import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingService } from '../shared/loading.service';
import { MenuService } from '../shared/menu.service';
import { UserService } from '../shared/user/user-service';
import { UtilisateurModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';
import { ChatService } from './chat.service';
import { PictureDialog } from './picture-dialog/picture-dialog';

// TODO ajouter un bouton pour afficher les messages qui sont avant

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('scrollingChat') private myScrollContainer: ElementRef;

  sujetCourant: string;
  utilisateurCourant: UtilisateurModel;
  messages: Array<ChatMessage>;
  typedMsg: string;

  pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  isPaused = false;
  firstLoad = true;

  private snackBarConfig: MatSnackBarConfig;

  constructor(private route: ActivatedRoute, private menuService: MenuService, private loadingService: LoadingService,
              private userService: UserService, private chatService: ChatService, private snackBar: MatSnackBar,
              private dialog: MatDialog) {

    this.typedMsg = '';
    this.snackBarConfig = new MatSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.loadingService.show(true);
    this.messages = null;
    this.isPaused = false;
    this.firstLoad = true;
    this.userService.getCurrent().then(user => this.utilisateurCourant = user);

    this.route.params.subscribe((params: Params) => {
      this.sujetCourant = params['sujet'];
      this.chatService.getLastMessagess(this.sujetCourant).then(messages => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 5);
        this.loadingService.show(false);
      });
      this.subscribeToRoom();
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
    this.chatService.send(this.sujetCourant, this.typedMsg.trim())
      .then(() => this.typedMsg = '')
      .catch(err => {
        console.error(err);
        this.snackBar.open(`Erreur envoie message`, '', this.snackBarConfig);
      });
  }

  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.unSubscribeToRoom();
    }
    this.isPaused = !this.isPaused;
  }

  openPopupAvaar(avatar: string) {
    console.log(avatar);
    this.dialog.open(PictureDialog, { data: avatar });
  }

  private subscribeToRoom() {
    this.chatService.getLastEvent(this.sujetCourant).on('value', (snapshot) => {
      if (this.firstLoad) {
        this.firstLoad = false;
      } else {
        const chatMessages: ChatMessage = snapshot.val();
        this.messages.push(Object.keys(chatMessages ? chatMessages : []).map(key => chatMessages[key])[0]);
        if (this.messages[this.messages.length - 1].expediteur.uid !== this.utilisateurCourant.uid) {
          const snackBarRef = this.snackBar.open(`Nouveau message reçu...`, `y aller`, this.snackBarConfig);
          snackBarRef.onAction().subscribe(() => {
            this.scrollToBottom();
          });
        }
      }
    });
  }

  private unSubscribeToRoom() {
    this.chatService.getLastEvent(this.sujetCourant).off();
  }

}
