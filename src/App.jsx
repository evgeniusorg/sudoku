import { useEffect, useState } from 'react';
import { Game } from './game/Game';
import { initSound } from './sound';
import { loadLang, saveLang } from './i18n';

export default function App() {
  const [lang, setLang] = useState(loadLang);

  useEffect(() => {
    initSound();
  }, []);

  const onSetLang = (value) => {
    setLang(value);
    saveLang(value);
  };

  return <Game lang={lang} onSetLang={onSetLang} />;
}
