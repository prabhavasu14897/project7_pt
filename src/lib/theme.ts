import { productConfig } from "@config/product.config";

const { theme } = productConfig;

function toKebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Turns `productConfig.theme` into `--cn-*` CSS custom properties.
 * Tailwind utilities in globals.css read these, so config stays the single source of truth.
 */
export function buildThemeCss(fontVariable?: string): string {
  const vars: string[] = [];

  for (const [key, value] of Object.entries(theme.colors)) {
    vars.push(`--cn-color-${toKebab(key)}: ${value};`);
  }
  for (const [key, tone] of Object.entries(theme.categoryTones)) {
    vars.push(`--cn-tone-${key}-fg: ${tone.fg};`, `--cn-tone-${key}-bg: ${tone.bg};`);
  }
  for (const [key, value] of Object.entries(theme.radius)) {
    vars.push(`--cn-radius-${key}: ${value}px;`);
  }
  for (const [key, [size, lineHeight]] of Object.entries(theme.typography)) {
    vars.push(`--cn-text-${key}: ${size / 16}rem;`, `--cn-text-${key}-lh: ${lineHeight / size};`);
  }
  for (const [key, value] of Object.entries(theme.shadows)) {
    vars.push(`--cn-shadow-${key}: ${value};`);
  }

  const sans = fontVariable ? `var(${fontVariable}), ${theme.fontFamily.sans}` : theme.fontFamily.sans;
  vars.push(`--cn-font-sans: ${sans};`);
  vars.push(`--cn-spacing: ${theme.spacingUnit / 16}rem;`);
  vars.push(`--cn-max-width: ${theme.maxContentWidth}px;`);

  return `:root{${vars.join("")}}`;
}
