type Lang = 'ja' | 'en';

type Key =
  | 'common.loading'
  | 'nav.home'
  | 'nav.history'
  | 'home.card.title'
  | 'home.label.occurred'
  | 'home.label.scheduled'
  | 'home.label.scheduledUnset'
  | 'home.diff.onTime'
  | 'home.empty'
  | 'home.button.resume'
  | 'home.button.snooze5'
  | 'home.button.abandon'
  | 'home.toast.resume'
  | 'home.toast.snooze'
  | 'home.toast.abandon'
  | 'history.status.resumed'
  | 'history.status.snoozed'
  | 'history.status.abandoned'
  | 'history.tag.none'
  | 'history.body.reasonPrefix'
  | 'history.body.firstStepPrefix'
  | 'history.body.returnAfterPrefix'
  | 'history.body.scheduledPrefix'
  | 'history.empty'
  | 'interruptButton.label'
  | 'interruptButton.subLabel'
  | 'trigger.section.custom'
  | 'trigger.input.placeholder'
  | 'trigger.button.add'
  | 'interruptModal.header'
  | 'interruptModal.section.trigger'
  | 'interruptModal.caption.reason'
  | 'interruptModal.caption.firstStep'
  | 'interruptModal.section.returnAfter'
  | 'interruptModal.unit.minute'
  | 'interruptModal.action.save'
  | 'toastProvider.missing';

const STRINGS: Record<Lang, Record<Key, string>> = {
  ja: {
    'common.loading': '読み込み中...',
    'nav.home': 'ホーム',
    'nav.history': '履歴',
    'home.card.title': '最新の作業中断',
    'home.label.occurred': '発生',
    'home.label.scheduled': '予定復帰',
    'home.label.scheduledUnset': '予定未設定',
    'home.diff.onTime': '±0分（予定どおり）',
    'home.empty': 'まだ休憩の記録はありません。\n上のボタンで初回の休憩を記録できます。',
    'home.button.resume': '復帰する',
    'home.button.snooze5': '5分延長する',
    'home.button.abandon': '終了する',
    'home.toast.resume': '復帰を記録しました。作業を再開しましょう！',
    'home.toast.snooze': '休憩を5分延長しました。(通知は未実装)',
    'home.toast.abandon': '作業を終了しました',
    'history.status.resumed': '復帰済み',
    'history.status.snoozed': 'あとで戻る',
    'history.status.abandoned': '未復帰',
    'history.tag.none': 'タグなし',
    'history.body.reasonPrefix': '理由',
    'history.body.firstStepPrefix': '復帰後の初手',
    'history.body.returnAfterPrefix': '予定復帰まで',
    'history.body.scheduledPrefix': '予定復帰時刻',
    'history.empty': '履歴がありません。休憩を記録するとここに表示されます。',
    'interruptButton.label': '少し休む',
    'interruptButton.subLabel': '無理せず一息つきましょう',
    'trigger.section.custom': 'カスタム',
    'trigger.input.placeholder': 'タグを追加',
    'trigger.button.add': '追加',
    'interruptModal.header': '中断',
    'interruptModal.section.trigger': 'きっかけ',
    'interruptModal.caption.reason': '理由メモ',
    'interruptModal.caption.firstStep': '戻ったら最初にやること',
    'interruptModal.section.returnAfter': '何分後に戻れそう？',
    'interruptModal.unit.minute': '分',
    'interruptModal.action.save': '休憩する',
    'toastProvider.missing': 'ToastProviderがツリーにありません',
  },
  en: {
    'common.loading': 'Loading...',
    'nav.home': 'Home',
    'nav.history': 'History',
    'home.card.title': 'Latest break',
    'home.label.occurred': 'Occurred',
    'home.label.scheduled': 'Scheduled return',
    'home.label.scheduledUnset': 'Not set',
    'home.diff.onTime': '±0 min (on time)',
    'home.empty': 'No breaks yet.\nTap the button above to log your first one.',
    'home.button.resume': 'Resume',
    'home.button.snooze5': 'Snooze 5 min',
    'home.button.abandon': 'End',
    'home.toast.resume': 'Recorded your return. Let’s get back to work!',
    'home.toast.snooze': 'Extended by 5 minutes. (Notification not implemented)',
    'home.toast.abandon': 'Marked as finished.',
    'history.status.resumed': 'Resumed',
    'history.status.snoozed': 'Snoozed',
    'history.status.abandoned': 'Not resumed',
    'history.tag.none': 'No tag',
    'history.body.reasonPrefix': 'Reason',
    'history.body.firstStepPrefix': 'First step after return',
    'history.body.returnAfterPrefix': 'Until scheduled return',
    'history.body.scheduledPrefix': 'Scheduled return time',
    'history.empty': 'No history yet. Logged breaks will appear here.',
    'interruptButton.label': 'Take a break',
    'interruptButton.subLabel': 'Pause and breathe',
    'trigger.section.custom': 'Custom',
    'trigger.input.placeholder': 'Add a tag',
    'trigger.button.add': 'Add',
    'interruptModal.header': 'Break',
    'interruptModal.section.trigger': 'Trigger',
    'interruptModal.caption.reason': 'Reason memo',
    'interruptModal.caption.firstStep': 'First step after return',
    'interruptModal.section.returnAfter': 'When will you be back?',
    'interruptModal.unit.minute': 'min',
    'interruptModal.action.save': 'Take a break',
    'toastProvider.missing': 'ToastProvider is not in the tree',
  },
};

let currentLang: Lang = 'ja';

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function t(key: Key): string {
  return STRINGS[currentLang][key];
}

