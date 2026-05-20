import { studyInsightsOverlayItem } from './customizations/viewportOverlayCustomization';

export default function getCustomizationModule() {
  return [
    {
      name: 'viewportOverlay.bottomRight',
      value: {
        $push: [studyInsightsOverlayItem],
      },
    },
  ];
}
