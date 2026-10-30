/**
 * Minimal template interpolation for localized strings containing `{token}`
 * placeholders (e.g. "One division = {interval} m").
 *
 * Deliberately tiny: the app needs substitution, not a full i18n engine. Unknown
 * tokens are left intact so a missing value is visible during development rather
 * than silently collapsing to "undefined".
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
}
