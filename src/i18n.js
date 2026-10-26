import { LS_LANG_KEY } from './constants';

export const LANGS = ['en', 'ru'];

const STRINGS = {
  en: {
    newGame: 'New game',
    menu: 'Menu',
    close: 'Close',
    settings: 'Settings',
    about: 'About',
    share: 'Share',
    time: 'Time',
    best: 'Best',
    sound: 'Sound',
    language: 'Language',
    lightBackground: 'Light background',
    hints: 'Hints',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    diagonals: 'Main diagonals',
    resetStats: 'Reset statistics',
    notes: 'Notes',
    erase: 'Erase',
    won: 'Solved!',
    wonTime: 'Time',
    newBest: 'New best time!',
    shareHint: 'Scan the QR code to open the game',
    installTitle: 'Install the app',
    installGotIt: 'Got it',
    aboutP1: 'Sudoku is a logic puzzle: fill the 9×9 grid with digits.',
    aboutHow: 'How to play:',
    aboutLi1: 'Fill the grid so that every row, column and 3×3 box contains the digits 1–9 exactly once.',
    aboutLi2: 'Some digits are already given and cannot be changed.',
    aboutLi3: 'Tap a cell, then tap a digit to place it.',
    aboutLi4: 'If enabled, each main diagonal must also contain the digits 1–9 exactly once.',
    aboutLi5: 'Use Notes to mark candidates and Erase to clear a cell.',
  },
  ru: {
    newGame: 'Новая игра',
    menu: 'Меню',
    close: 'Закрыть',
    settings: 'Настройки',
    about: 'О проекте',
    share: 'Поделиться',
    time: 'Время',
    best: 'Рекорд',
    sound: 'Звук',
    language: 'Язык',
    lightBackground: 'Светлый фон',
    hints: 'Подсказки',
    difficulty: 'Сложность',
    easy: 'Лёгкий',
    medium: 'Средний',
    hard: 'Сложный',
    expert: 'Эксперт',
    diagonals: 'Главные диагонали',
    resetStats: 'Сбросить статистику',
    notes: 'Заметки',
    erase: 'Стереть',
    won: 'Решено!',
    wonTime: 'Время',
    newBest: 'Новый рекорд времени!',
    shareHint: 'Отсканируйте QR-код, чтобы открыть игру',
    installTitle: 'Установите приложение',
    installGotIt: 'Понятно',
    aboutP1: 'Судоку — логическая головоломка: заполните поле 9×9 цифрами.',
    aboutHow: 'Как играть:',
    aboutLi1: 'Заполните поле так, чтобы в каждой строке, столбце и блоке 3×3 цифры от 1 до 9 встречались ровно по одному разу.',
    aboutLi2: 'Часть цифр уже стоит на поле — их нельзя менять.',
    aboutLi3: 'Коснитесь клетки, затем цифры, чтобы вписать её.',
    aboutLi4: 'Если включено, каждая главная диагональ тоже должна содержать цифры 1–9 по одному разу.',
    aboutLi5: '«Заметки» — для кандидатов, «Стереть» — чтобы очистить клетку.',
  },
};

export const INSTALL_STEPS = {
  en: {
    ios: [
      'Open this page in Safari.',
      'Tap the Share button — the square with an up arrow.',
      'Choose "Add to Home Screen".',
      'Tap "Add".',
    ],
    android: [
      'Open the browser menu — the "⋮" button in the corner.',
      'Choose "Install app" or "Add to Home screen".',
      'Confirm the installation.',
    ],
    other: [
      'Tap the install icon in the browser address bar.',
      'Confirm the installation.',
    ],
  },
  ru: {
    ios: [
      'Откройте эту страницу в браузере Safari.',
      'Нажмите кнопку «Поделиться» — квадрат со стрелкой вверх.',
      'Выберите «На экран "Домой"».',
      'Нажмите «Добавить».',
    ],
    android: [
      'Откройте меню браузера — кнопка «⋮» в углу.',
      'Выберите «Установить приложение» или «Добавить на главный экран».',
      'Подтвердите установку.',
    ],
    other: [
      'Нажмите значок установки в адресной строке браузера.',
      'Подтвердите установку приложения.',
    ],
  },
};

export function detectLang() {
  try {
    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return nav.startsWith('ru') ? 'ru' : 'en';
  } catch (e) {
    return 'en';
  }
}

export function loadLang() {
  try {
    const saved = localStorage.getItem(LS_LANG_KEY);
    if (saved === 'en' || saved === 'ru') {
      return saved;
    }
  } catch (e) {
    // ignore storage errors
  }
  return detectLang();
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LS_LANG_KEY, lang);
  } catch (e) {
    // ignore storage errors
  }
}

export function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}
