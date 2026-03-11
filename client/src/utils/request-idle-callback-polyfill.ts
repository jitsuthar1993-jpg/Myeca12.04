// requestIdleCallback polyfill for browsers that don't support it

type IdleDeadline = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleRequestCallback = (deadline: IdleDeadline) => void;

type IdleRequestOptions = {
  timeout?: number;
};

declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}

// Polyfill implementation
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ): number {
    const timeout = options?.timeout || 1;
    const start = Date.now();
    
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, timeout);
  };
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function (handle: number): void {
    clearTimeout(handle);
  };
}

// Utility function to execute tasks during idle time
export function executeWhenIdle<T>(
  task: () => T | Promise<T>,
  options?: IdleRequestOptions
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestIdleCallback(
      async (deadline) => {
        try {
          // If we have enough time or it's a critical task
          if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
            const result = await task();
            resolve(result);
          } else {
            // Re-schedule if not enough time
            executeWhenIdle(task, options).then(resolve).catch(reject);
          }
        } catch (error) {
          reject(error);
        }
      },
      options
    );
  });
}

// Batch multiple tasks to run during idle time
export class IdleTaskQueue {
  private tasks: Array<() => void | Promise<void>> = [];
  private isProcessing = false;
  private timeout: number;

  constructor(timeout = 1000) {
    this.timeout = timeout;
  }

  add(task: () => void | Promise<void>): void {
    this.tasks.push(task);
    this.processTasks();
  }

  private processTasks(): void {
    if (this.isProcessing || this.tasks.length === 0) return;

    this.isProcessing = true;

    requestIdleCallback(
      async (deadline) => {
        while (this.tasks.length > 0 && deadline.timeRemaining() > 0) {
          const task = this.tasks.shift();
          if (task) {
            try {
              await task();
            } catch (error) {
              console.error('Error executing idle task:', error);
            }
          }
        }

        this.isProcessing = false;

        // Continue processing if there are more tasks
        if (this.tasks.length > 0) {
          this.processTasks();
        }
      },
      { timeout: this.timeout }
    );
  }

  clear(): void {
    this.tasks = [];
    this.isProcessing = false;
  }

  get pending(): number {
    return this.tasks.length;
  }
}

// Create a global idle task queue
export const globalIdleQueue = new IdleTaskQueue();

// Helper to defer non-critical initialization
export function deferInitialization(
  init: () => void | Promise<void>,
  priority: 'high' | 'normal' | 'low' = 'normal'
): void {
  const timeout = priority === 'high' ? 100 : priority === 'normal' ? 1000 : 5000;
  
  globalIdleQueue.add(init);
}