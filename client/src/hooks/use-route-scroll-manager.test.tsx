import { cleanup, render } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouteScrollManager } from './use-route-scroll-manager';

function RouteScrollHarness({ location }: { location: string }) {
  useRouteScrollManager(location);
  return null;
}

let frameCallbacks: Map<number, FrameRequestCallback>;
let nextFrameId: number;
let scrollToMock: ReturnType<typeof vi.fn>;

function setUrl(path: string) {
  window.history.pushState({}, '', path);
}

function setScrollRestoration(value: ScrollRestoration) {
  Object.defineProperty(window.history, 'scrollRestoration', {
    configurable: true,
    writable: true,
    value,
  });
}

function runAnimationFrames() {
  const callbacks = Array.from(frameCallbacks.values());
  frameCallbacks.clear();
  callbacks.forEach((callback) => callback(0));
}

beforeEach(() => {
  vi.useFakeTimers();
  frameCallbacks = new Map();
  nextFrameId = 1;
  scrollToMock = vi.fn();

  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: scrollToMock,
  });
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    writable: true,
    value: vi.fn((callback: FrameRequestCallback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      frameCallbacks.set(frameId, callback);
      return frameId;
    }),
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    writable: true,
    value: vi.fn((frameId: number) => {
      frameCallbacks.delete(frameId);
    }),
  });

  setScrollRestoration('auto');
  document.body.innerHTML = '';
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  setUrl('/');
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useRouteScrollManager', () => {
  it('scrolls normal route changes to the top immediately and after deferred retries', () => {
    const { rerender } = render(<RouteScrollHarness location="/" />);

    scrollToMock.mockClear();
    document.documentElement.scrollTop = 900;
    document.body.scrollTop = 700;
    setUrl('/pricing');

    rerender(<RouteScrollHarness location="/pricing" />);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);

    scrollToMock.mockClear();
    act(() => {
      runAnimationFrames();
      vi.advanceTimersByTime(350);
    });

    expect(scrollToMock).toHaveBeenCalled();
  });

  it('scrolls to an existing hash target instead of forcing the page top', () => {
    const target = document.createElement('section');
    target.id = 'all';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    setUrl('/learn/videos#all');

    render(<RouteScrollHarness location="/learn/videos" />);

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('falls back to the page top when a hash target cannot be found', () => {
    setUrl('/learn/videos#missing');

    render(<RouteScrollHarness location="/learn/videos" />);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('handles hash-only navigation after the route has mounted', () => {
    const target = document.createElement('section');
    target.id = 'all';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    setUrl('/learn/videos');
    render(<RouteScrollHarness location="/learn/videos" />);

    scrollToMock.mockClear();
    setUrl('/learn/videos#all');
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('handles same-page hash link clicks even when the router updates history itself', () => {
    const target = document.createElement('section');
    target.id = 'all';
    target.scrollIntoView = vi.fn();
    const link = document.createElement('a');
    link.href = '#all';
    link.textContent = 'View all';
    document.body.append(target, link);
    setUrl('/learn/videos');
    render(<RouteScrollHarness location="/learn/videos" />);
    act(() => {
      runAnimationFrames();
      vi.advanceTimersByTime(350);
    });

    scrollToMock.mockClear();
    vi.mocked(target.scrollIntoView).mockClear();
    act(() => {
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
      vi.advanceTimersByTime(0);
    });

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it('sets browser scroll restoration to manual and restores the previous value on unmount', () => {
    setScrollRestoration('auto');

    const { unmount } = render(<RouteScrollHarness location="/" />);

    expect(window.history.scrollRestoration).toBe('manual');

    unmount();

    expect(window.history.scrollRestoration).toBe('auto');
  });

  it('cancels stale delayed scroll work when navigation changes quickly', () => {
    setUrl('/learn/videos#old');
    const { rerender } = render(<RouteScrollHarness location="/learn/videos" />);
    const oldTarget = document.createElement('section');
    oldTarget.id = 'old';
    oldTarget.scrollIntoView = vi.fn();
    document.body.appendChild(oldTarget);

    scrollToMock.mockClear();
    setUrl('/pricing');
    rerender(<RouteScrollHarness location="/pricing" />);

    act(() => {
      runAnimationFrames();
      vi.advanceTimersByTime(350);
    });

    expect(oldTarget.scrollIntoView).not.toHaveBeenCalled();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
