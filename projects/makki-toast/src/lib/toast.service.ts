import { Injectable, signal } from '@angular/core';
import { ToastItem, ToastOptions, ToastPosition } from './toast.types';

const DEFAULT_DURATION = 3000;
const EXIT_DURATION = DEFAULT_DURATION * 0.1;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private idCounter = 0;

  toasts = signal<ToastItem[]>([]);
  position = signal<ToastPosition>('top-right');
  globalOptions = signal<Partial<ToastOptions> | undefined>(undefined);

  private generateId() {
    return `${++this.idCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  dismiss(id: string) {
    const item = this.toasts().find((t) => t.id === id);
    if (!item || item.exiting) return;

    this.toasts.update(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));

    setTimeout(() => {
      this.toasts.update(prev => prev.filter(t => t.id !== id));
    }, EXIT_DURATION);
  }

  private resolveAutopilot(opts: ToastOptions, duration: number | null) {
    if (opts.autopilot === false || !duration || duration <= 0) return {};

    const expandDelay = 150; 
    const collapseDelay = Math.max(0, duration - 100);

    return {
      autoExpandDelayMs: expandDelay,
      autoCollapseDelayMs: collapseDelay,
    };
  }

  private createToast(options: ToastOptions) {
    const merged = { ...this.globalOptions(), ...options };
    const id = merged.id ?? `app-${this.generateId()}`;
    const duration = merged.duration === undefined ? DEFAULT_DURATION : merged.duration;
    const auto = this.resolveAutopilot(merged, duration);

    const item: ToastItem = {
      ...merged,
      id,
      instanceId: this.generateId(),
      position: merged.position ?? this.position(),
      ...auto
    };

    this.toasts.update(prev => {
      const existingIndex = prev.findIndex(t => t.id === id);
      if (existingIndex > -1) {
        const newArr = [...prev];
        newArr[existingIndex] = { ...item };
        return newArr;
      }
      return [...prev.filter(t => t.id !== id), item];
    });

    if (duration !== null && duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return { id, duration };
  }

  show(opts: ToastOptions) { return this.createToast(opts).id; }
  success(opts: ToastOptions) { return this.createToast({ ...opts, state: 'success' }).id; }
  error(opts: ToastOptions) { return this.createToast({ ...opts, state: 'error' }).id; }
  warning(opts: ToastOptions) { return this.createToast({ ...opts, state: 'warning' }).id; }
  info(opts: ToastOptions) { return this.createToast({ ...opts, state: 'info' }).id; }
  action(opts: ToastOptions) { return this.createToast({ ...opts, state: 'action' }).id; }

  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    opts: { loading: ToastOptions; success: ToastOptions | ((d: T) => ToastOptions); error: ToastOptions | ((e: any) => ToastOptions) }
  ): Promise<T> {
    const p = typeof promise === 'function' ? promise() : promise;
    const id = this.createToast({ ...opts.loading, state: 'loading', duration: null }).id;

    const startTime = Date.now();

    p.then(data => {
      const duration = Date.now() - startTime;
      const successOpts = typeof opts.success === 'function' ? opts.success(data) : opts.success;
      const executionDelay = duration < 500 ? 100 : 0;

      setTimeout(() => {
        this.createToast({ 
          ...successOpts, 
          state: 'success', 
          id, 
          duration: successOpts.duration ?? 6000 
        });
      }, executionDelay);

    }).catch(err => {
      const errorOpts = typeof opts.error === 'function' ? opts.error(err) : opts.error;
      this.createToast({ ...errorOpts, state: 'error', id, duration: errorOpts.duration ?? 3000 });
    });

    return p;
  }
}
