export function createVirtualScrollState(itemHeight = 72, buffer = 2) {
  return {
    allItems: [],
    itemHeight,
    containerHeight: 0,
    viewportHeight: 0,
    scrollTop: 0,
    buffer,
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
  };
}

export function calculateVisibleRange(state) {
  const startKey = 'quero-cafe:vs:calcRange:start';
  if (typeof performance !== 'undefined') performance.mark(startKey);

  const { allItems, itemHeight, viewportHeight, scrollTop, buffer } = state;
  const totalItems = allItems.length;
  if (totalItems === 0 || viewportHeight === 0) {
    state.startIndex = 0;
    state.endIndex = 0;
    state.offsetY = 0;
    state.containerHeight = 0;
    return;
  }

  state.containerHeight = totalItems * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer,
  );

  state.startIndex = startIndex;
  state.endIndex = endIndex;
  state.offsetY = startIndex * itemHeight;

  if (typeof performance !== 'undefined') {
    const endKey = 'quero-cafe:vs:calcRange:end';
    performance.mark(endKey);
    performance.measure('quero-cafe:vs:calcRange', startKey, endKey);
    performance.clearMarks(startKey);
    performance.clearMarks(endKey);
  }
}

export function getVisibleItems(state) {
  const startKey = 'quero-cafe:vs:slice:start';
  if (typeof performance !== 'undefined') performance.mark(startKey);

  const result = state.allItems.slice(state.startIndex, state.endIndex);

  if (typeof performance !== 'undefined') {
    const endKey = 'quero-cafe:vs:slice:end';
    performance.mark(endKey);
    performance.measure('quero-cafe:vs:slice', startKey, endKey);
    performance.clearMarks(startKey);
    performance.clearMarks(endKey);
  }

  return result;
}
