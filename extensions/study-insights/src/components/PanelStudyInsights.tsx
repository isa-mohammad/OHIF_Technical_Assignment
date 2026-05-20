import React, { useCallback, useEffect, useState } from 'react';
import { DicomMetadataStore } from '@ohif/core';
import {
  getStudyInsightsMetadata,
  type StudyInsightsMetadata,
} from '../utils/getStudyInsightsMetadata';

type PanelStudyInsightsProps = {
  servicesManager: AppTypes.ServicesManager;
};

function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-aqua-pale mb-1 text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-common-light break-all text-sm font-medium">{value}</div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="border-input-danger bg-secondary-dark text-input-danger rounded border p-3 text-sm"
      role="alert"
    >
      {message}
    </div>
  );
}

export default function PanelStudyInsights({ servicesManager }: PanelStudyInsightsProps) {
  const [insights, setInsights] = useState<StudyInsightsMetadata | null>(null);

  const refresh = useCallback(() => {
    setInsights(getStudyInsightsMetadata(servicesManager));
  }, [servicesManager]);

  useEffect(() => {
    refresh();

    const subscriptions = [
      DicomMetadataStore.subscribe(DicomMetadataStore.EVENTS.STUDY_ADDED, refresh),
      DicomMetadataStore.subscribe(DicomMetadataStore.EVENTS.INSTANCES_ADDED, refresh),
      DicomMetadataStore.subscribe(DicomMetadataStore.EVENTS.SERIES_ADDED, refresh),
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [refresh]);

  if (!insights) {
    return <div className="text-common-light p-4 text-sm opacity-70">Loading study insights…</div>;
  }

  if (!insights.ok) {
    return (
      <div className="p-4">
        <ErrorBanner message={insights.message} />
        <button
          type="button"
          className="text-aqua-pale mt-4 text-sm underline"
          onClick={refresh}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="text-common-light p-4">
      <h3 className="text-common-bright mb-4 text-base font-semibold">Study Insights</h3>
      <MetadataRow label="Study UID" value={insights.studyInstanceUID} />
      <MetadataRow label="Patient Name" value={insights.patientName} />
      <MetadataRow label="Modality" value={insights.modality} />
      <MetadataRow label="Number of Series" value={String(insights.seriesCount)} />
    </div>
  );
}
