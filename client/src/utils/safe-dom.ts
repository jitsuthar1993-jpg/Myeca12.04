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

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function<T extends Node>(node: T, child: Node | null): T {
      try {
        if (child && child.parentNode !== this) {
          // If the reference node is not a child of this parent, 
          // just append at the end to avoid crashing the whole React tree.
          return originalInsertBefore.call(this, node, null) as T;
        }
        return originalInsertBefore.call(this, node, child) as T;
      } catch {
        return originalInsertBefore.call(this, node, null) as T;
      }
    };
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

