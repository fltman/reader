import { useState, useRef, useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { SettingsPanel } from './components/SettingsPanel';
import { ReadingRuler } from './components/ReadingRuler';
import { BionicText } from './components/BionicText';
import { WordPopup } from './components/WordPopup';
import { fontFamilyMap } from './types';

const SAMPLE_TEXT = `Välkommen till Läsaren

Detta är en läsare speciellt utformad för att hjälpa personer med dyslexi. Du kan justera inställningarna för att hitta det som fungerar bäst för dig.

Prova att ändra typsnitt till OpenDyslexic, som är speciellt designat för dyslektiker. Du kan också aktivera Bionic Reading, som gör de första bokstäverna i varje ord fetare för att hjälpa ögat att följa texten.

Läslinjalen följer din muspekare och hjälper dig att fokusera på en rad i taget. Du kan justera färg, genomskinlighet och höjd.

Håll ner Alt-tangenten och klicka på ett ord för att få det uppläst eller förklarat.

Ladda upp din egen text genom att klicka på knappen ovan, eller klistra in text direkt.`;

interface WordPopupState {
  word: string;
  position: { x: number; y: number };
}

function App() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [text, setText] = useState(SAMPLE_TEXT);
  const [wordPopup, setWordPopup] = useState<WordPopupState | null>(null);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track scroll position for overlay text
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to show text at top on initial load
  useEffect(() => {
    const initialScroll = window.innerHeight - 56 - 100; // padding-top minus desired visible padding
    window.scrollTo(0, initialScroll);
    setScrollY(initialScroll);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsKioskMode(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleWordAltClick = (word: string, position: { x: number; y: number }) => {
    setWordPopup({ word, position });
  };

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Reading Ruler */}
      {settings.readingRuler && (
        <ReadingRuler
          color={settings.rulerColor}
          opacity={settings.rulerOpacity}
          height={settings.rulerHeight}
          snap={settings.rulerSnap}
          snapOffset={settings.rulerSnapOffset}
          lineHeight={settings.lineHeight}
          fontSize={settings.fontSize}
          textColor={settings.rulerTextColor}
        />
      )}

      {/* Top Bar - hidden in kiosk mode */}
      {!isKioskMode && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.html"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Ladda fil"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <button
                onClick={handlePaste}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Klistra in"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Öppna inställningar"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Kiosk mode: small settings button */}
      {isKioskMode && (
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white/80 rounded-full transition-all opacity-30 hover:opacity-100"
          aria-label="Öppna inställningar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <main
        className="min-h-screen transition-all duration-200 relative"
        style={{
          paddingTop: isKioskMode ? '100vh' : 'calc(100vh - 56px)',
          paddingBottom: '100vh',
          paddingLeft: `${settings.marginLeft}%`,
          paddingRight: `${settings.marginRight}%`,
        }}
      >
        <article
          className="max-w-none"
          style={{
            fontFamily: fontFamilyMap[settings.fontFamily],
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            color: settings.textColor,
          }}
        >
          <BionicText
            text={text}
            enabled={settings.bionicReading}
            onWordAltClick={handleWordAltClick}
          />
        </article>

        {/* Overlay text with ruler text color - clipped to ruler area */}
        {settings.readingRuler && (
          <article
            className="max-w-none fixed left-0 right-0 pointer-events-none"
            style={{
              fontFamily: fontFamilyMap[settings.fontFamily],
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              color: settings.rulerTextColor,
              top: 0,
              transform: `translateY(-${scrollY}px)`,
              paddingTop: isKioskMode ? '100vh' : 'calc(100vh - 56px)',
              paddingBottom: '100vh',
              paddingLeft: `${settings.marginLeft}%`,
              paddingRight: `${settings.marginRight}%`,
              clipPath: `inset(calc(var(--ruler-top) + ${scrollY}px) 0 calc(100% - var(--ruler-bottom) - ${scrollY}px) 0)`,
            }}
            aria-hidden="true"
          >
            <BionicText
              text={text}
              enabled={settings.bionicReading}
            />
          </article>
        )}
      </main>

      {/* Word Popup */}
      {wordPopup && (
        <WordPopup
          word={wordPopup.word}
          position={wordPopup.position}
          onClose={() => setWordPopup(null)}
          apiKey={settings.openaiApiKey}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        updateSetting={updateSetting}
        resetSettings={resetSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
