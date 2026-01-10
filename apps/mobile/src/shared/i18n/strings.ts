type Lang = 'ja';

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
  | 'history.status.onbreak'
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
    'nav.home': 'ダッシュボード',
    'nav.history': '履歴',
    'home.card.title': '最新の作業中断',
    'home.label.occurred': '中断発生',
    'home.label.scheduled': '再開予定',
    'home.label.scheduledUnset': '予定未設定',
    'home.diff.onTime': '±0分（予定どおり）',
    'home.empty': 'まだ作業中断の記録はありません。\n上のボタンで初回の中断を記録できます。',
    'home.button.resume': '再開する',
    'home.button.snooze5': '5分延長する',
    'home.button.abandon': '終了する',
    'home.toast.resume': '作業の再開を記録しました！',
    'home.toast.snooze': '中断を5分延長しました。',
    'home.toast.abandon': '作業を終了しました',
    'history.status.resumed': '再開済',
    'history.status.onbreak': '再開予定',
    'history.status.abandoned': '終了',
    'history.tag.none': 'タグなし',
    'history.body.reasonPrefix': '理由',
    'history.body.firstStepPrefix': '再開後の初手',
    'history.body.returnAfterPrefix': '再開予定まで',
    'history.body.scheduledPrefix': '再開予定時刻',
    'history.empty': '履歴がありません。中断を記録するとここに表示されます。',
    'interruptButton.label': '作業を中断する',
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
    'interruptModal.action.save': '中断する',
    'toastProvider.missing': 'ToastProviderがツリーにありません',
  },
}

let currentLang: Lang = 'ja';

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function t(key: Key): string {
  return STRINGS[currentLang][key];
}

