import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class  LoadingService {

  private showSource = new Subject<boolean>();

  showSource$: Observable<boolean> = this.showSource.asObservable();

  show(show: boolean) {
    this.showSource.next(show);
  }
}
