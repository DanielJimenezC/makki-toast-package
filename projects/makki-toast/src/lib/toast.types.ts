import { Type } from "@angular/core";

export type ToastState =
  | 'success'
  | 'loading'
  | 'error'
  | 'warning'
  | 'info'
  | 'action';

export interface ToastStyles {
  title?: string;
  description?: string;
  badge?: string;
  button?: string;
}

export interface ToastButton {
  title: string;
  onClick: () => void;
}

export const TOAST_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export type ToastPosition = (typeof TOAST_POSITIONS)[number];

export interface ToastComponentPayload {
  component: Type<any>;
  inputs?: Record<string, any>;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string | Type<any> | ToastComponentPayload; 
  position?: ToastPosition;
  duration?: number | null;
  icon?: string | Type<any>; 
  styles?: ToastStyles;
  fill?: string;
  roundness?: number;
  autopilot?: boolean | { expand?: number; collapse?: number };
  button?: ToastButton;
  state?: ToastState;
}

export interface ToastItem extends ToastOptions {
  id: string;
  instanceId: string;
  exiting?: boolean;
  autoExpandDelayMs?: number;
  autoCollapseDelayMs?: number;
}
