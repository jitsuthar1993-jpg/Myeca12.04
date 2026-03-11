export type RegistrationType = 'sole' | 'company' | 'partnership' | 'llp';

export interface TimingEstimate {
  type: RegistrationType;
  estimatedMinutes: number;
  steps: Array<{ id: string; label: string; estimatedMinutes: number }>;
}

export interface TimingSnapshot {
  type: RegistrationType;
  startedAt: number;
  stepStartedAt: number;
  elapsedMs: number;
  remainingMs: number;
  currentStepId?: string;
  stepElapsedMs: number;
  stepRemainingMs: number;
}

export class TimingService {
  private estimate: TimingEstimate;
  private startedAt: number | null = null;
  private currentStepId: string | undefined;
  private stepStartedAt: number | null = null;

  constructor(estimate: TimingEstimate) {
    this.estimate = estimate;
  }

  start(): void {
    this.startedAt = performance.now();
  }

  startStep(stepId: string): void {
    this.currentStepId = stepId;
    this.stepStartedAt = performance.now();
  }

  endStep(): void {
    this.currentStepId = undefined;
    this.stepStartedAt = null;
  }

  getSnapshot(): TimingSnapshot {
    const now = performance.now();
    const totalMs = this.estimate.estimatedMinutes * 60_000;
    const elapsedMs = this.startedAt ? now - this.startedAt : 0;
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const currentStep = this.estimate.steps.find(s => s.id === this.currentStepId);
    const stepTotalMs = (currentStep?.estimatedMinutes || 0) * 60_000;
    const stepElapsedMs = this.stepStartedAt ? now - this.stepStartedAt : 0;
    const stepRemainingMs = Math.max(0, stepTotalMs - stepElapsedMs);
    return {
      type: this.estimate.type,
      startedAt: this.startedAt || 0,
      stepStartedAt: this.stepStartedAt || 0,
      elapsedMs,
      remainingMs,
      currentStepId: this.currentStepId,
      stepElapsedMs,
      stepRemainingMs,
    };
  }

  static formatMs(ms: number): string {
    const sec = Math.round(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }
}

export const REGISTRATION_ESTIMATES: Record<RegistrationType, TimingEstimate> = {
  sole: {
    type: 'sole',
    estimatedMinutes: 15,
    steps: [
      { id: 'details', label: 'Business Details', estimatedMinutes: 5 },
      { id: 'documents', label: 'Documents Upload', estimatedMinutes: 6 },
      { id: 'review', label: 'Review & Submit', estimatedMinutes: 4 },
    ],
  },
  company: {
    type: 'company',
    estimatedMinutes: 30,
    steps: [
      { id: 'promoters', label: 'Promoters & Directors', estimatedMinutes: 10 },
      { id: 'capital', label: 'Share Capital & MOA', estimatedMinutes: 10 },
      { id: 'documents', label: 'Documents Upload', estimatedMinutes: 6 },
      { id: 'review', label: 'Review & Submit', estimatedMinutes: 4 },
    ],
  },
  partnership: {
    type: 'partnership',
    estimatedMinutes: 20,
    steps: [
      { id: 'partners', label: 'Partners & Deed', estimatedMinutes: 8 },
      { id: 'documents', label: 'Documents Upload', estimatedMinutes: 6 },
      { id: 'review', label: 'Review & Submit', estimatedMinutes: 6 },
    ],
  },
  llp: {
    type: 'llp',
    estimatedMinutes: 25,
    steps: [
      { id: 'designated', label: 'Designated Partners', estimatedMinutes: 8 },
      { id: 'agreement', label: 'LLP Agreement', estimatedMinutes: 9 },
      { id: 'documents', label: 'Documents Upload', estimatedMinutes: 4 },
      { id: 'review', label: 'Review & Submit', estimatedMinutes: 4 },
    ],
  },
};
