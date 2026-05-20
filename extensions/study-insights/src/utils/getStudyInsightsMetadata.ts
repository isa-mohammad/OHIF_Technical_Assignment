import { DicomMetadataStore, utils } from '@ohif/core';

const { formatPN } = utils;

export type StudyInsightsErrorCode =
  | 'NO_STUDY'
  | 'MISSING_METADATA'
  | 'STUDY_NOT_LOADED'
  | 'INVALID_VIEWPORT';

export type StudyInsightsMetadata =
  | {
      ok: true;
      studyInstanceUID: string;
      patientName: string;
      modality: string;
      seriesCount: number;
    }
  | {
      ok: false;
      code: StudyInsightsErrorCode;
      message: string;
    };

/**
 * Resolves the primary study UID for insights: active viewport display set first,
 * then the first study in DicomMetadataStore.
 */
export function resolvePrimaryStudyInstanceUID(
  servicesManager: AppTypes.ServicesManager
): string | null {
  const { viewportGridService, displaySetService } = servicesManager.services;

  const activeViewportId = viewportGridService.getActiveViewportId?.();
  if (activeViewportId) {
    const displaySetUIDs = viewportGridService.getDisplaySetsUIDsForViewport(activeViewportId);
    const displaySet = displaySetUIDs?.[0]
      ? displaySetService.getDisplaySetByUID(displaySetUIDs[0])
      : null;

    if (displaySet?.StudyInstanceUID) {
      return displaySet.StudyInstanceUID;
    }
  }

  const studyUIDs = DicomMetadataStore.getStudyInstanceUIDs();
  return studyUIDs?.[0] ?? null;
}

/**
 * Reads study-level metadata from DicomMetadataStore with explicit error results.
 */
export function getStudyInsightsMetadata(
  servicesManager: AppTypes.ServicesManager,
  studyInstanceUID?: string | null
): StudyInsightsMetadata {
  const uid =
    studyInstanceUID ?? resolvePrimaryStudyInstanceUID(servicesManager);

  if (!uid) {
    return {
      ok: false,
      code: 'NO_STUDY',
      message: 'No study is loaded. Open a study in the viewer first.',
    };
  }

  const study = DicomMetadataStore.getStudy(uid);

  if (!study) {
    return {
      ok: false,
      code: 'STUDY_NOT_LOADED',
      message: `Study ${uid} is not available in metadata store. The study may still be loading or failed to load.`,
    };
  }

  if (!study.series?.length) {
    return {
      ok: false,
      code: 'MISSING_METADATA',
      message: 'Study metadata is incomplete: no series found.',
    };
  }

  const firstInstance = study.series[0]?.instances?.[0];
  const patientNameRaw = study.PatientName ?? firstInstance?.PatientName;
  const patientName = patientNameRaw ? formatPN(patientNameRaw) : '—';

  const modalities = new Set<string>();
  study.series.forEach(series => {
    if (series.Modality) {
      modalities.add(series.Modality);
    }
  });

  const modality =
    modalities.size > 0 ? Array.from(modalities).sort().join(', ') : '—';

  return {
    ok: true,
    studyInstanceUID: uid,
    patientName,
    modality,
    seriesCount: study.series.length,
  };
}
