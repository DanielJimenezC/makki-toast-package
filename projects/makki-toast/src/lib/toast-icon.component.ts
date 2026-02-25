import { Component, Input } from '@angular/core';
import { ToastState } from './toast.types';

@Component({
  selector: 'toast-icon',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @switch (state) {
        @case ('success') { <path d="M20 6 9 17l-5-5" /> }
        @case ('loading') { <path d="M21 12a9 9 0 1 1-6.219-8.56" [attr.data-makki-icon]="'spin'" /> }
        @case ('error') { <path d="M18 6 6 18" /><path d="m6 6 12 12" /> }
        @case ('warning') { <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /> }
        @case ('info') { <circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /> }
        @case ('action') { <path d="M5 12h14" /><path d="m12 5 7 7-7 7" /> }
      }
    </svg>
  `
})
export class ToastIconComponent {
  @Input() state!: ToastState;
}