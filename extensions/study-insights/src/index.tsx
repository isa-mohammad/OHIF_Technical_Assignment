import { Types, ToolbarService } from '@ohif/core';
import { id } from './id';
import getPanelModule from './getPanelModule';
import getToolbarModule from './getToolbarModule';
import getCommandsModule from './getCommandsModule';
import getCustomizationModule from './getCustomizationModule';
import { initStackScrollPrefetch } from './utils/stackScrollPrefetch';
import {
  STUDY_INSIGHTS_PANEL_ID,
  STUDY_INSIGHTS_TOOLBAR_BUTTON_ID,
} from './constants';

let teardownPrefetch: (() => void) | undefined;

const studyInsightsExtension: Types.Extensions.Extension = {
  id,

  onModeEnter: (params: withAppTypes) => {
    teardownPrefetch = initStackScrollPrefetch(params);

    const { servicesManager } = params;
    const { toolbarService } = servicesManager.services;

    toolbarService.register([
      {
        id: STUDY_INSIGHTS_TOOLBAR_BUTTON_ID,
        uiType: 'ohif.toolButton',
        props: {
          icon: 'info',
          label: 'Study Insights',
          tooltip: 'View study metadata and open Study Insights panel',
          commands: 'openStudyInsightsPanel',
          evaluate: ['evaluate.action', 'evaluate.studyInsights'],
        },
      },
    ]);

    toolbarService.updateSection(ToolbarService.TOOLBAR_SECTIONS.primary, [
      STUDY_INSIGHTS_TOOLBAR_BUTTON_ID,
    ]);
  },

  onModeExit: () => {
    teardownPrefetch?.();
    teardownPrefetch = undefined;
  },

  getPanelModule,
  getToolbarModule,
  getCommandsModule,
  getCustomizationModule,
};

export default studyInsightsExtension;
