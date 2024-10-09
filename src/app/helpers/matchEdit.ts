import { animate, style, transition, trigger } from '@angular/animations';

export function myAnimations() {
  return [
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px' }),
        animate('0.3s ease-in', style({ opacity: 1, maxHeight: '1000px' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, maxHeight: '1000px' }),
        animate('0.3s ease-in', style({ opacity: 0, maxHeight: '0px' })),
      ]),
    ]),
    trigger('starAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('0.2s ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('0s ease-in', style({ opacity: 0, transform: 'scale(0)' })),
      ]),
    ]),
  ];
}
