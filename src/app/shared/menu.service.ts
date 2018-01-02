import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MenuService {

  private toggleMenuSource = new Subject<string>();

  toggleMenuSource$: Observable<string> = this.toggleMenuSource.asObservable();

  toggle() {
    this.toggleMenuSource.next('');
  }

}
