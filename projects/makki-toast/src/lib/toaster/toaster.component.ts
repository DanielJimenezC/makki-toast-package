import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { ToastComponent } from '../toast/toast.component';
import { ToastService } from '../toast.service';
import { TOAST_POSITIONS, ToastPosition } from '../toast.types';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [ToastComponent],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../toast.css'],
  template: `
    @for (pos of positions; track pos) {
      @if (groupedToasts()[pos]?.length) {
        <section data-app-viewport [attr.data-position]="pos" aria-live="polite">
          @for (item of groupedToasts()[pos]; track item.id) {
            <app-toast 
              [item]="item"
              [activeId]="activeId()"
              [expandDir]="pos.startsWith('top') ? 'bottom' : 'top'"
              [pillAlign]="pos.includes('right') ? 'right' : (pos.includes('center') ? 'center' : 'left')"
              (dismiss)="toastService.dismiss(item.id)"
            />
          }
        </section>
      }
    }
  `
})
export class ToasterComponent {
  toastService = inject(ToastService);
  positions = TOAST_POSITIONS;

  groupedToasts = computed(() => {
    const map: Partial<Record<ToastPosition, any[]>> = {};
    for (const t of this.toastService.toasts()) {
      const pos = t.position || 'top-right';
      if (!map[pos]) map[pos] = [];
      map[pos]!.push(t);
    }
    return map;
  });

  activeId = computed(() => {
    const toasts = this.toastService.toasts();
    for (let i = toasts.length - 1; i >= 0; i--) {
      if (!toasts[i].exiting) return toasts[i].id;
    }
    return undefined;
  });
}
