import { AfterViewInit, Component, computed, effect, ElementRef, Input, NgZone, OnDestroy, output, signal, ViewChild } from '@angular/core';
import { ToastIconComponent } from '../toast-icon.component';
import { ToastItem } from '../toast.types';
import { SafeHtmlPipe } from "../safe-html.pipe";
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastIconComponent, SafeHtmlPipe, NgComponentOutlet],
  templateUrl: './toast.component.html'
})
export class ToastComponent implements AfterViewInit, OnDestroy {
  HEIGHT = 40;
  WIDTH = 350;
  DEFAULT_ROUNDNESS = 18;
  BLUR_RATIO = 0.5;
  PILL_PADDING = 10;
  MIN_EXPAND_RATIO = 2.25;

  private _item!: ToastItem;
  @Input({ required: true }) 
  set item(val: ToastItem) {
    this._item = val;
    this.itemSignal.set(val);
  }
  get item() { return this._item; }
  
  itemSignal = signal<ToastItem>({} as ToastItem);
  @Input() activeId?: string;
  @Input() expandDir!: 'top' | 'bottom';
  @Input() pillAlign!: 'left' | 'center' | 'right';
  
  dismiss = output<void>();

  @ViewChild('innerRef') innerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('headerRef') headerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('contentRef') contentRef!: ElementRef<HTMLDivElement>;
  @ViewChild('buttonRef') buttonRef!: ElementRef<HTMLButtonElement>;

  isExpanded = signal(false);
  ready = signal(false);
  pillWidth = signal(0);
  contentHeight = signal(0);

  isStringDesc = computed(() => typeof this.itemSignal().description === 'string');
  
  descComponent = computed(() => {
    const desc = this.itemSignal().description;
    if (typeof desc === 'function') return desc;
    if (desc && typeof desc === 'object' && 'component' in desc) {
      return desc.component;
    }
    return null; 
  });

  descInputs = computed(() => {
    const desc = this.itemSignal().description;
    if (desc && typeof desc === 'object' && 'inputs' in desc) {
      return desc.inputs as Record<string, any>;
    }
    return {};
  });
  
  descString = computed(() => this.itemSignal().description as string);
  hasDesc = computed(() => !!this.itemSignal().description || !!this.itemSignal().button);

  hasCustomIcon = computed(() => !!this.itemSignal().icon);
  isStringIcon = computed(() => typeof this.itemSignal().icon === 'string');
  iconString = computed(() => this.itemSignal().icon as string);
  
  iconComponent = computed(() => {
    const icon = this.itemSignal().icon;
    return typeof icon === 'function' ? (icon) : null;
  });

  isLoading = computed(() => this.itemSignal().state === 'loading');
  open = computed(() => this.hasDesc() && this.isExpanded() && !this.isLoading());
  
  resolvedRoundness = computed(() => Math.max(0, this.itemSignal().roundness ?? this.DEFAULT_ROUNDNESS));
  blur = computed(() => this.resolvedRoundness() * this.BLUR_RATIO);
  filterId = computed(() => `toast-makki-${this.itemSignal().id}`);

  expanded = computed(() => {
    const minExpanded = this.HEIGHT * this.MIN_EXPAND_RATIO;
    return this.hasDesc() ? Math.max(minExpanded, this.HEIGHT + this.contentHeight()) : minExpanded;
  });

  svgHeight = computed(() => this.hasDesc() ? Math.max(this.expanded(), this.HEIGHT * this.MIN_EXPAND_RATIO) : this.HEIGHT);
  expandedContent = computed(() => Math.max(0, this.expanded() - this.HEIGHT));
  resolvedPillWidth = computed(() => Math.max(this.pillWidth() || this.HEIGHT, this.HEIGHT));
  pillHeight = computed(() => this.HEIGHT + this.blur() * 3);
  pillX = computed(() => {
    const pillWidth = this.resolvedPillWidth();
    if (this.pillAlign === 'right') { return this.WIDTH - pillWidth; }
    if (this.pillAlign === 'center') { return (this.WIDTH - pillWidth) / 2; }
    return 0;
  });

  private resizeObserver?: ResizeObserver;
  private pointerStart: number | null = null;
  private timeouts: any[] = [];

  constructor(private readonly ngZone: NgZone) {
    effect(() => {
      const item = this.itemSignal();
      if (!item?.id) return;

      const state = item.state; 
      const id = item.id;
      
      const allow = state !== 'loading' && (this.activeId === undefined || this.activeId === id);
      this.clearTimeouts();

      if (!item.exiting && allow && this.hasDesc()) {
        const delay = item.autoExpandDelayMs ?? 150;

        this.timeouts.push(setTimeout(() => {
          this.isExpanded.set(true);
          setTimeout(() => this.measure(), 100); 
        }, delay));

        if (item.autoCollapseDelayMs) {
          this.timeouts.push(setTimeout(() => {
            this.isExpanded.set(false);
          }, item.autoCollapseDelayMs));
        }
      } else {
        this.isExpanded.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.ready.set(true));

    this.resizeObserver = new ResizeObserver(() => {
      this.measure();
    });

    if (this.innerRef?.nativeElement) this.resizeObserver.observe(this.innerRef.nativeElement);
    if (this.contentRef?.nativeElement) this.resizeObserver.observe(this.contentRef.nativeElement);

    this.setupSwipe();
  }

  handleButtonClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.item.button && typeof this.item.button.onClick === 'function') {
      this.item.button.onClick();
    }
  }

  measure() {
    if (this.innerRef && this.headerRef) {
      const header = this.headerRef.nativeElement;
      const cs = getComputedStyle(header);
      const px = Number.parseFloat(cs.paddingLeft) + Number.parseFloat(cs.paddingRight);
      const w = this.innerRef.nativeElement.scrollWidth + px + this.PILL_PADDING;
      if (w > this.PILL_PADDING && w !== this.pillWidth()) this.pillWidth.set(w);
    }
    if (this.contentRef) {
      const h = this.contentRef.nativeElement.scrollHeight;
      if (h !== this.contentHeight()) this.contentHeight.set(h);
    }
  }

  setupSwipe() {
    this.ngZone.runOutsideAngular(() => {
      const el = this.buttonRef.nativeElement;

      el.addEventListener('pointerdown', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-app-button]')) {
          return; 
        }
        
        if (this.item.exiting) return;
        this.pointerStart = e.clientY;
        el.setPointerCapture(e.pointerId);
      });

      el.addEventListener('pointermove', (e) => {
        if (this.pointerStart === null) return;
        const dy = e.clientY - this.pointerStart;
        const clamped = Math.min(Math.abs(dy), 20) * (dy > 0 ? 1 : -1);
        el.style.transform = `translateY(${clamped}px)`;
      });

      el.addEventListener('pointerup', (e) => {
        if (this.pointerStart === null) return;
        const dy = e.clientY - this.pointerStart;
        this.pointerStart = null;
        el.style.transform = '';
        if (Math.abs(dy) > 30) {
          this.ngZone.run(() => this.dismiss.emit());
        }
      });
    });
  }

  clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.clearTimeouts();
  }
}
