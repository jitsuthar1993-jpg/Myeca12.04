// Enhanced Mobile Touch Feedback System
// Provides comprehensive touch feedback including haptic, visual, and audio feedback

export interface TouchFeedbackConfig {
  hapticEnabled: boolean;
  visualEnabled: boolean;
  audioEnabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

export class MobileTouchFeedback {
  private static instance: MobileTouchFeedback;
  private config: TouchFeedbackConfig;
  private audioContext: AudioContext | null = null;
  private vibrationSupported: boolean = false;

  static getInstance(): MobileTouchFeedback {
    if (!MobileTouchFeedback.instance) {
      MobileTouchFeedback.instance = new MobileTouchFeedback();
    }
    return MobileTouchFeedback.instance;
  }

  constructor() {
    this.config = {
      hapticEnabled: this.isHapticSupported(),
      visualEnabled: true,
      audioEnabled: this.isAudioSupported(),
      intensity: 'medium'
    };

    this.initializeAudioContext();
    this.setupTouchListeners();
    this.loadUserPreferences();
  }

  private isHapticSupported(): boolean {
    return 'vibrate' in navigator;
  }

  private isAudioSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
  }

  private initializeAudioContext(): void {
    if (this.isAudioSupported()) {
      try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
        this.config.audioEnabled = false;
      }
    }
  }

  private setupTouchListeners(): void {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private loadUserPreferences(): void {
    const savedConfig = localStorage.getItem('touchFeedbackConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      } catch (error) {
        console.warn('Failed to load touch feedback preferences:', error);
      }
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    const target = event.target as Element;
    if (this.shouldProvideFeedback(target)) {
      this.provideFeedback(target, 'start');
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const target = event.target as Element;
    if (this.shouldProvideFeedback(target)) {
      this.provideFeedback(target, 'end');
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const target = event.target as Element;
    if (this.shouldProvideFeedback(target)) {
      this.provideFeedback(target, 'start');
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    const target = event.target as Element;
    if (this.shouldProvideFeedback(target)) {
      this.provideFeedback(target, 'end');
    }
  }

  private shouldProvideFeedback(element: Element): boolean {
    const interactiveElements = [
      'BUTTON',
      'A',
      'INPUT',
      'SELECT',
      'TEXTAREA',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[tabindex="0"]'
    ];

    return interactiveElements.some(selector => {
      if (selector.startsWith('[')) {
        return element.matches(selector);
      }
      return element.tagName === selector;
    });
  }

  private provideFeedback(element: Element, phase: 'start' | 'end'): void {
    const feedbackType = this.determineFeedbackType(element);
    
    if (phase === 'start') {
      this.provideStartFeedback(element, feedbackType);
    } else {
      this.provideEndFeedback(element, feedbackType);
    }
  }

  private determineFeedbackType(element: Element): 'button' | 'link' | 'input' | 'card' | 'generic' {
    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      return 'button';
    }
    
    if (element.tagName === 'A' || element.getAttribute('role') === 'link') {
      return 'link';
    }
    
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      return 'input';
    }
    
    if (element.closest('.card') || element.classList.contains('card')) {
      return 'card';
    }
    
    return 'generic';
  }

  private provideStartFeedback(element: Element, type: string): void {
    // Haptic feedback
    if (this.config.hapticEnabled) {
      this.triggerHapticFeedback('light');
    }

    // Visual feedback
    if (this.config.visualEnabled) {
      this.addVisualFeedback(element, 'start', type);
    }

    // Audio feedback
    if (this.config.audioEnabled) {
      this.playAudioFeedback('start', type);
    }

    // Add active state
    element.classList.add('touch-active');
  }

  private provideEndFeedback(element: Element, type: string): void {
    // Haptic feedback
    if (this.config.hapticEnabled) {
      this.triggerHapticFeedback('medium');
    }

    // Visual feedback
    if (this.config.visualEnabled) {
      this.removeVisualFeedback(element, type);
    }

    // Audio feedback
    if (this.config.audioEnabled) {
      this.playAudioFeedback('end', type);
    }

    // Remove active state
    element.classList.remove('touch-active');
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.config.hapticEnabled || !('vibrate' in navigator)) {
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 50, 30]
    };

    const pattern = patterns[this.config.intensity] || patterns.medium;
    navigator.vibrate(pattern);
  }

  private addVisualFeedback(element: Element, phase: 'start' | 'end', type: string): void {
    const visualEffects = {
      button: {
        start: ['scale-down', 'shadow-intensify', 'color-brighten'],
        end: ['scale-return', 'shadow-normal', 'color-return']
      },
      link: {
        start: ['underline-appear', 'color-intensify'],
        end: ['underline-disappear', 'color-return']
      },
      input: {
        start: ['border-highlight', 'shadow-focus'],
        end: ['border-normal', 'shadow-normal']
      },
      card: {
        start: ['elevation-raise', 'shadow-intensify'],
        end: ['elevation-return', 'shadow-normal']
      },
      generic: {
        start: ['highlight'],
        end: ['normal']
      }
    };

    const effects = visualEffects[type]?.[phase] || visualEffects.generic[phase];
    effects.forEach(effect => {
      element.classList.add(`touch-${effect}`);
    });

    // Add ripple effect for buttons and cards
    if ((type === 'button' || type === 'card') && phase === 'start') {
      this.addRippleEffect(element);
    }
  }

  private removeVisualFeedback(element: Element, type: string): void {
    // Remove all touch-related classes
    const touchClasses = Array.from(element.classList).filter(cls => cls.startsWith('touch-'));
    touchClasses.forEach(cls => element.classList.remove(cls));

    // Remove ripple effect
    const ripple = element.querySelector('.touch-ripple');
    if (ripple) {
      ripple.classList.add('touch-ripple-fade-out');
      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
      }, 300);
    }
  }

  private addRippleEffect(element: Element): void {
    const ripple = document.createElement('span');
    ripple.className = 'touch-ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // Animate the ripple
    requestAnimationFrame(() => {
      ripple.classList.add('touch-ripple-active');
    });
  }

  private playAudioFeedback(phase: 'start' | 'end', type: string): void {
    if (!this.audioContext) return;

    const frequencies = {
      button: { start: 800, end: 600 },
      link: { start: 600, end: 500 },
      input: { start: 1000, end: 800 },
      card: { start: 400, end: 350 },
      generic: { start: 500, end: 450 }
    };

    const frequency = frequencies[type]?.[phase] || frequencies.generic[phase];
    const duration = phase === 'start' ? 0.05 : 0.1;
    
    this.playTone(frequency, duration);
  }

  private playTone(frequency: number, duration: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Public API methods
  public setConfig(config: Partial<TouchFeedbackConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveUserPreferences();
  }

  public getConfig(): TouchFeedbackConfig {
    return { ...this.config };
  }

  public enableHapticFeedback(): void {
    this.config.hapticEnabled = true;
    this.saveUserPreferences();
  }

  public disableHapticFeedback(): void {
    this.config.hapticEnabled = false;
    this.saveUserPreferences();
  }

  public enableVisualFeedback(): void {
    this.config.visualEnabled = true;
    this.saveUserPreferences();
  }

  public disableVisualFeedback(): void {
    this.config.visualEnabled = false;
    this.saveUserPreferences();
  }

  public enableAudioFeedback(): void {
    this.config.audioEnabled = true;
    this.saveUserPreferences();
  }

  public disableAudioFeedback(): void {
    this.config.audioEnabled = false;
    this.saveUserPreferences();
  }

  public setIntensity(intensity: 'light' | 'medium' | 'heavy'): void {
    this.config.intensity = intensity;
    this.saveUserPreferences();
  }

  public triggerCustomFeedback(element: Element, type: 'success' | 'error' | 'warning'): void {
    switch (type) {
      case 'success':
        this.triggerHapticFeedback('medium');
        this.playTone(800, 0.1);
        break;
      case 'error':
        this.triggerHapticFeedback('heavy');
        this.playTone(300, 0.2);
        break;
      case 'warning':
        this.triggerHapticFeedback('light');
        this.playTone(500, 0.15);
        break;
    }
    
    // Add visual feedback
    if (this.config.visualEnabled) {
      element.classList.add(`touch-${type}`);
      setTimeout(() => element.classList.remove(`touch-${type}`), 1000);
    }
  }

  private saveUserPreferences(): void {
    localStorage.setItem('touchFeedbackConfig', JSON.stringify(this.config));
  }

  // Utility methods
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public getSupportedFeatures(): Record<string, boolean> {
    return {
      haptic: this.isHapticSupported(),
      audio: this.isAudioSupported(),
      touch: 'ontouchstart' in window
    };
  }
}

// CSS for touch feedback effects
const touchFeedbackStyles = `
/* Touch Feedback System Styles */

.touch-active {
  transition: all 0.15s ease-out;
}

/* Scale effects */
.touch-scale-down {
  transform: scale(0.95);
}

.touch-scale-return {
  transform: scale(1);
}

/* Shadow effects */
.touch-shadow-intensify {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.touch-shadow-focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.touch-shadow-normal {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Color effects */
.touch-color-brighten {
  filter: brightness(1.1);
}

.touch-color-intensify {
  filter: saturate(1.2);
}

.touch-color-return {
  filter: none;
}

/* Border effects */
.touch-border-highlight {
  border-color: #3b82f6;
  border-width: 2px;
}

.touch-border-normal {
  border-color: #d1d5db;
  border-width: 1px;
}

/* Elevation effects */
.touch-elevation-raise {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.touch-elevation-return {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Ripple effect */
.touch-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: none;
  pointer-events: none;
}

.touch-ripple-active {
  animation: ripple-animation 0.6s ease-out;
}

.touch-ripple-fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Success/Error/Warning feedback */
.touch-success {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.touch-error {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.touch-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .touch-active {
    transition: none;
  }
  
  .touch-ripple {
    animation: none;
  }
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = touchFeedbackStyles;
  document.head.appendChild(styleElement);
}

// Global interface extensions
declare global {
  interface Window {
    touchFeedback: MobileTouchFeedback;
  }
}

// Export singleton instance
export const touchFeedback = MobileTouchFeedback.getInstance();
window.touchFeedback = touchFeedback;

export default touchFeedback;