---
title: Tabs
description: A tabbed navigation component for switching between content panels.
---

A wrapper around React Aria's `Tabs`, `TabList`, `Tab`, and `TabPanel` components.
Manages ARIA tab/tabpanel relationship and keyboard navigation automatically.

## Add via CLI

```bash
npx @a2ra/cli add tabs
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | — | Tab definitions (see below) |
| `defaultSelectedKey` | `string` | — | Uncontrolled initially selected tab ID |
| `selectedKey` | `string` | — | Controlled selected tab ID |
| `disabledKeys` | `string[]` | — | IDs of non-interactive tabs |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Tab list direction |
| `keyboardActivation` | `"automatic" \| "manual"` | `"automatic"` | Whether arrow keys also activate tabs |
| `ariaLabel` | `string` | — | ARIA label for the tab list |
| `children` | `node[]` | — | Content panels, matched to tab IDs in order |

### TabItem shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique tab identifier |
| `label` | `string` | Visible tab text |
| `isDisabled` | `boolean` | Disables this tab |

## Example

```json
{
  "type": "Tabs",
  "props": {
    "tabs": [
      { "id": "overview", "label": "Overview" },
      { "id": "activity", "label": "Activity" },
      { "id": "settings", "label": "Settings" }
    ],
    "defaultSelectedKey": "overview"
  },
  "children": [
    { "type": "Text", "children": "Overview content here." },
    { "type": "Text", "children": "Activity feed here." },
    { "type": "Text", "children": "Settings panel here." }
  ]
}
```

## Notes

- `children` are matched to `tabs` by position. The first child is the panel for the first tab, etc.
- `keyboardActivation: "manual"` requires pressing `Enter` or `Space` to activate a focused tab.
  Use this when switching tabs triggers a data fetch to avoid unnecessary requests.
- The tab list has `role="tablist"` and each panel has `role="tabpanel"` with `aria-labelledby`
  pointing to its tab, all managed by React Aria.
