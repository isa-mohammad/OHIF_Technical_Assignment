import { Types } from '@ohif/core';

const getToolbarModule = ({ servicesManager }: Types.Extensions.ExtensionParams) => {
  const { displaySetService, viewportGridService } = servicesManager.services;

  return [
    {
      name: 'evaluate.studyInsights',
      evaluate: () => {
        const activeViewportId = viewportGridService.getActiveViewportId?.();
        if (!activeViewportId) {
          return {
            disabled: true,
            disabledText: 'No active viewport',
          };
        }

        const displaySetUIDs =
          viewportGridService.getDisplaySetsUIDsForViewport(activeViewportId);
        if (!displaySetUIDs?.length) {
          return {
            disabled: true,
            disabledText: 'No display set in viewport',
          };
        }

        const displaySet = displaySetService.getDisplaySetByUID(displaySetUIDs[0]);
        if (!displaySet) {
          return {
            disabled: true,
            disabledText: 'Display set not available',
          };
        }

        return { disabled: false };
      },
    },
  ];
};

export default getToolbarModule;
