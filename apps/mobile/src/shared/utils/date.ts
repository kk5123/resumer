import { t } from "../i18n/strings";

export function formatLocalShort(iso: string, locale = 'ja-JP') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
}

type DurationUnitKey =
  | 'duration.unit.day'
  | 'duration.unit.hour'
  | 'duration.unit.minute'
  | 'duration.unit.second';

type FormatDiffOptions = {
  includeSeconds?: boolean; // デフォルト false
  showZeroUnit?: boolean;   // 0の単位を出すか（デフォルト false）
};

export function formatDiffHuman(diffMs: number, opts: FormatDiffOptions = {}) {
  const { includeSeconds = false, showZeroUnit = false } = opts;
  const totalSec = Math.round(diffMs / 1000);
  const sign = totalSec === 0
    ? t('duration.sign.zero')
    : totalSec > 0
      ? t('duration.sign.plus')
      : t('duration.sign.minus');

  const absSec = Math.abs(totalSec);
  if (absSec === 0) return `${sign}0${t('duration.unit.minute')}`;

  const days = Math.floor(absSec / 86_400);
  const hours = Math.floor((absSec % 86_400) / 3600);
  const mins = Math.floor((absSec % 3600) / 60);
  const secs = absSec % 60;

  const parts: string[] = [];
  const push = (value: number, unitKey: DurationUnitKey) => {
    if (!showZeroUnit && value === 0) return;
    parts.push(`${value}${t(unitKey)}`);
  };

  if (days > 0) {
    push(days, 'duration.unit.day');
    push(hours, 'duration.unit.hour');
    push(mins, 'duration.unit.minute');
    if (includeSeconds) push(secs, 'duration.unit.second');
  } else {
    push(hours, 'duration.unit.hour');
    push(mins, 'duration.unit.minute');
    if (includeSeconds) push(secs, 'duration.unit.second');
  }

  return `${sign}${parts.join('')}`;
}
