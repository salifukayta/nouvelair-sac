import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textFromCamelCase'
})
export class TextFromCamelCasePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let text: string = value.split(/(?=[A-Z])/).join` `;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

}
