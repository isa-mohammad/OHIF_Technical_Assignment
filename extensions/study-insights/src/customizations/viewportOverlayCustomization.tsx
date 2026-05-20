import React from 'react';

/**
 * Custom viewport overlay (assignment #3).
 *
 * Note: OHIF evaluates `condition` with a limited props object (viewportId,
 * displaySet, instanceNumber, etc.) — NOT viewportData/imageSliceData.
 * contentF receives the full props including imageSliceData and servicesManager.
 */
export const studyInsightsOverlayItem = {
  id: 'StudyInsightsStackOverlay',
  title: 'Study Insights: image index, total count, active viewport',
  // viewportId is always passed to condition; stack-only check happens in contentF
  condition: ({ viewportId }) => Boolean(viewportId),
  contentF: ({ viewportId, imageSliceData, servicesManager }) => {
    if (!imageSliceData || !servicesManager || !viewportId) {
      return null;
    }

    const { imageIndex, numberOfSlices } = imageSliceData;
    const { viewportGridService } = servicesManager.services;
    const activeViewportId = viewportGridService.getActiveViewportId?.() ?? '—';

    return (
      <div
        className="overlay-item flex flex-col text-xs"
        title="Study Insights viewport overlay"
      >
        <span>
          <span className="mr-0.5 opacity-70">Index:</span>
          {imageIndex}
        </span>
        <span>
          <span className="mr-0.5 opacity-70">Total:</span>
          {numberOfSlices || '—'}
        </span>
        <span>
          <span className="mr-0.5 opacity-70">Active VP:</span>
          {activeViewportId}
        </span>
      </div>
    );
  },
};
