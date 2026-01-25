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

export const DateHelpers = {
  startOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  
  endOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },
  
  addMinutes(date: Date | string, minutes: number): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.getTime() + minutes * 60_000);
  },
  
  getWeekRange(date: Date = new Date(), weekStart: 'monday' | 'sunday'): {
    start: Date;
    end: Date;
  } {
    const start = DateHelpers.startOfDay(date);
    const dayOfWeek = start.getDay();
    const daysToStart = weekStart === 'monday' 
      ? (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      : dayOfWeek;
    
    start.setDate(start.getDate() - daysToStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  },
  
  formatWithWeekday(date: Date, locale = 'ja-JP'): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    return `${month}/${day}(${weekday})`;
  },
};
