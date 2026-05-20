import React from 'react';
import PanelStudyInsights from './components/PanelStudyInsights';

const getPanelModule = ({ servicesManager }: withAppTypes) => {
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
