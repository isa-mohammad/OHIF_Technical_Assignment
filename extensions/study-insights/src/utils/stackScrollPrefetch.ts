import {
  cache,
  Enums,
  eventTarget,
  imageLoadPoolManager,
  imageLoader,
  StackViewport,
} from '@cornerstonejs/core';
import type { Types } from '@ohif/core';

/**
 * Lightweight stack prefetch (assignment requirement #4).
 *
 * Approach:
 * - Subscribe to Cornerstone STACK_NEW_IMAGE (fires on stack scroll).
 * - When the user scrolls past slice index 10 (0-based: viewing image 11+),
 *   enqueue background loads for the next PREFETCH_AHEAD_COUNT slices via
 *   imageLoadPoolManager at RequestType.Prefetch so interaction loads stay prioritized.
 * - Skip imageIds already in cache; track per-stack to avoid duplicate enqueue.
 */
const PREFETCH_TRIGGER_INDEX = 10;
const PREFETCH_AHEAD_COUNT = 5;

const prefetchedForStack = new Map<string, Set<number>>();

function getStackKey(viewport: StackViewport): string {
  const imageIds = viewport.getImageIds?.() ?? [];
  return imageIds[0] ?? viewport.id;
}

function prefetchAhead(viewport: StackViewport, currentIndex: number): void {
  const imageIds = viewport.getImageIds?.() ?? [];
  if (!imageIds.length || currentIndex < PREFETCH_TRIGGER_INDEX) {
    return;
  }

  const stackKey = getStackKey(viewport);
  let prefetched = prefetchedForStack.get(stackKey);
  if (!prefetched) {
    prefetched = new Set();
    prefetchedForStack.set(stackKey, prefetched);
  }

  const start = currentIndex + 1;
  const end = Math.min(start + PREFETCH_AHEAD_COUNT, imageIds.length);

  for (let i = start; i < end; i++) {
    if (prefetched.has(i)) {
      continue;
    }

    const imageId = imageIds[i];
    if (!imageId || cache.isImageCached(imageId)) {
      prefetched.add(i);
      continue;
    }

    prefetched.add(i);

    imageLoadPoolManager.addRequest(
      () =>
        imageLoader.loadAndCacheImage(imageId).catch(() => {
          prefetched.delete(i);
        }),
      Enums.RequestType.Prefetch,
      { imageId, stackKey, prefetchIndex: i },
      0
    );
  }
}

function onStackNewImage(evt: CustomEvent): void {
  const { viewport, imageIdIndex } = evt.detail ?? {};
  if (!viewport || !(viewport instanceof StackViewport)) {
    return;
  }

  const index =
    typeof imageIdIndex === 'number' ? imageIdIndex : viewport.getCurrentImageIdIndex();
  prefetchAhead(viewport, index);
}

let isInitialized = false;

export function initStackScrollPrefetch(_params: Types.Extensions.ExtensionParams): () => void {
  if (isInitialized) {
    return () => undefined;
  }
  isInitialized = true;

  eventTarget.addEventListener(Enums.Events.STACK_NEW_IMAGE, onStackNewImage);

  return () => {
    eventTarget.removeEventListener(Enums.Events.STACK_NEW_IMAGE, onStackNewImage);
    prefetchedForStack.clear();
    isInitialized = false;
  };
}
