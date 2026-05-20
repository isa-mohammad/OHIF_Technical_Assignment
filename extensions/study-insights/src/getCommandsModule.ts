import { Types } from '@ohif/core';
import { getStudyInsightsMetadata } from './utils/getStudyInsightsMetadata';
import { STUDY_INSIGHTS_PANEL_ID } from './constants';

const getCommandsModule = ({
  servicesManager,
}: Types.Extensions.ExtensionParams): Types.Extensions.CommandsModule => {
  const { panelService, uiNotificationService } = servicesManager.services;

  const actions = {
    openStudyInsightsPanel: () => {
      const metadata = getStudyInsightsMetadata(servicesManager);

      if (!metadata.ok) {
        uiNotificationService?.show?.({
          title: 'Study Insights',
          message: metadata.message,
          type: 'error',
          duration: 5000,
        });
        return;
      }

      panelService.activatePanel(STUDY_INSIGHTS_PANEL_ID, true);
    },
  };

  const definitions = {
    openStudyInsightsPanel: {
      commandFn: actions.openStudyInsightsPanel,
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'CORNERSTONE',
  };
};

export default getCommandsModule;
