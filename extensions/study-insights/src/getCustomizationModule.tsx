import viewportOverlayCustomization from './customizations/viewportOverlayCustomization';

export default function getCustomizationModule() {
  return [
    {
      name: 'default',
      value: {
        ...viewportOverlayCustomization,
      },
    },
  ];
}
