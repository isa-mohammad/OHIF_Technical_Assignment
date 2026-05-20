import React from 'react';
import { Types } from '@ohif/core';
import PanelStudyInsights from './components/PanelStudyInsights';

const getPanelModule = ({ servicesManager }: Types.Extensions.ExtensionParams) => {
  return [
    {
      name: 'studyInsights',
      iconName: 'info',
      iconLabel: 'Insights',
      label: 'Study Insights',
      component: () => <PanelStudyInsights servicesManager={servicesManager} />,
    },
  ];
};

export default getPanelModule;

