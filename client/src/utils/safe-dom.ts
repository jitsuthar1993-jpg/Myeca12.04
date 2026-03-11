(() => {
  const originalRemoveChild = Node.prototype.removeChild;
  if (!(Object.prototype as any).hasOwnProperty.call(Node.prototype, '__safeRemoveChildPatched')) {
    Object.defineProperty(Node.prototype, '__safeRemoveChildPatched', {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });

    Node.prototype.removeChild = function(child: Node) {
      try {
        if (!child || child.parentNode !== this) {
          return child;
        }
        return originalRemoveChild.call(this, child);
      } catch {
        return child;
      }
    } as typeof Node.prototype.removeChild;
  }

  const originalElementRemove = Element.prototype.remove;
  if (originalElementRemove) {
    Element.prototype.remove = function(this: Element) {
      try {
        if (this.parentNode) {
          // Use the patched removeChild
          this.parentNode.removeChild(this);
        }
      } catch {
        // no-op
      }
    } as typeof Element.prototype.remove;
  }
})();

