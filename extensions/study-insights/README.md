# @ohif/extension-study-insights

OHIF technical assignment implementation: study metadata panel, viewport overlay, stack prefetch, and error handling—implemented as a standalone extension (no new mode).

## Features

| Requirement | Implementation |
|-------------|----------------|
| Toolbar button **Study Insights** | Registered in `onModeEnter` via `toolbarService` |
| Study metadata panel | `panelModule.studyInsights` + `PanelStudyInsights.tsx` |
| Viewport overlay | `getCustomizationModule` → `viewportOverlay.bottomRight` (`$push`) |
| Prefetch after slice 10 | `utils/stackScrollPrefetch.ts` |
| Error handling | `utils/getStudyInsightsMetadata.ts` + notifications |

## Architecture decisions

### Extension-only (no new mode)

All behavior lives in `@ohif/extension-study-insights`. Existing modes (`@ohif/mode-basic`, `@ohif/mode-longitudinal`) only declare:

- `extensionDependencies` entry so the extension loads
- `rightPanels` entry so the panel survives `panelService.reset()` on study load

Toolbar buttons are added in the extension `onModeEnter` hook (after the mode registers its buttons), using `toolbarService.updateSection` to append to the primary section.

### OHIF extension points used

- **`getPanelModule`** – right-side Study Insights panel
- **`getToolbarModule`** – `evaluate.studyInsights` (disable when viewport/display set invalid)
- **`getCommandsModule`** – `openStudyInsightsPanel` (CORNERSTONE context)
- **`getCustomizationModule`** – viewport overlay items on `viewportOverlay.bottomRight` via `$push`
- **`onModeEnter` / `onModeExit`** – toolbar registration and prefetch lifecycle
- **Services**: `DicomMetadataStore`, `displaySetService`, `viewportGridService`, `panelService`, `uiNotificationService`, `cornerstoneViewportService`
- **Cornerstone**: `STACK_NEW_IMAGE`, `imageLoadPoolManager`, `imageLoader.loadAndCacheImage`, `RequestType.Prefetch`

### Prefetch approach

See comments in `src/utils/stackScrollPrefetch.ts`. Summary:

1. Listen globally to `STACK_NEW_IMAGE`.
2. When `imageIdIndex >= 10`, enqueue up to 5 subsequent `imageId`s on the prefetch pool.
3. Skip cached images; track indices per stack to avoid duplicate requests.

### Error handling

`getStudyInsightsMetadata` returns discriminated union results:

- `NO_STUDY` – nothing in metadata store / viewport
- `STUDY_NOT_LOADED` – UID present but study object missing
- `MISSING_METADATA` – study without series
- Invalid viewport – toolbar evaluate + overlay condition

The command shows `uiNotificationService` errors; the panel shows inline messages with retry.

## Challenges

- **Panel lifecycle**: `panelService.reset()` on study load clears panels from layout only—panel must be listed in mode `rightPanels`, not only `addPanel` in `onModeEnter`.
- **Customization merge**: Overlay uses `$push` on `viewportOverlay.bottomRight` so it appears below the built-in `I: … (1/763)` line without replacing it.
- **Command context**: Commands use `CORNERSTONE` default context to match the viewer toolbar.

## Maintainability during OHIF upgrades

1. Keep all assignment logic in this extension; avoid core edits.
2. Pin extension API usage to documented modules (`panelModule`, `customizationModule`, services).
3. On upgrade, verify: `toolbarService.register` / `updateSection`, customization overlay keys, Cornerstone `STACK_NEW_IMAGE` + pool manager API.
4. Mode changes should remain limited to `extensionDependencies` + `rightPanels` string.

## Development

The extension is registered in `platform/app/pluginConfig.json`. Run the viewer from the monorepo root:

```bash
yarn dev
```

Open a study in the basic/longitudinal viewer route, click **Study Insights** in the primary toolbar, and scroll a stack past slice 11 to trigger prefetch.
