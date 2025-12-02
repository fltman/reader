import { useState, useEffect, useRef } from 'react';

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  apiKey?: string;
}

async function getOpenAIExplanation(word: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'Du är en hjälpsam assistent som förklarar svenska ord på ett enkelt sätt för personer med dyslexi. Ge korta, tydliga förklaringar på 1-2 meningar. Använd enkla ord.',
        },
        {
          role: 'user',
          content: `Förklara ordet "${word}" på ett enkelt sätt.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('API-anrop misslyckades');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function speakWithOpenAI(text: string, apiKey: string): Promise<void> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'nova',
      speed: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error('TTS-anrop misslyckades');
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Kunde inte spela upp ljud'));
    };
    audio.play();
  });
}

export function WordPopup({ word, position, onClose, apiKey }: WordPopupProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Clean word from punctuation for speech
  const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '');

  const speakWord = async () => {
    if (!apiKey) {
      setError('Ange en OpenAI API-nyckel i inställningarna');
      return;
    }

    setIsSpeaking(true);
    setError(null);

    try {
      await speakWithOpenAI(cleanWord, apiKey);
    } catch {
      setError('Kunde inte läsa upp ordet');
    } finally {
      setIsSpeaking(false);
    }
  };

  const explainWord = async () => {
    if (!apiKey) {
      setError('Ange en OpenAI API-nyckel i inställningarna');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const explanationText = await getOpenAIExplanation(cleanWord, apiKey);
      setExplanation(explanationText);

      // Speak the explanation
      setIsSpeaking(true);
      try {
        await speakWithOpenAI(`${cleanWord}. ${explanationText}`, apiKey);
      } finally {
        setIsSpeaking(false);
      }
    } catch {
      setError('Kunde inte hämta förklaring. Kontrollera din API-nyckel.');
    } finally {
      setIsLoading(false);
    }
  };

  // Position the popup so it doesn't go off screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 280),
    y: position.y + 10,
  };

  // If popup would go below viewport, show above
  if (adjustedPosition.y + 200 > window.innerHeight) {
    adjustedPosition.y = position.y - 150;
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-2xl border-2 border-gray-200"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: '320px',
        padding: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <span className="font-bold text-xl text-gray-900">{cleanWord}</span>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 p-1 transition-colors"
          aria-label="Stäng"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '16px' }} className="p-3 bg-red-50 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div style={{ marginBottom: '16px' }} className="p-4 bg-gray-50 rounded-xl text-base text-gray-700 leading-relaxed">
          {explanation}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={speakWord}
          disabled={isSpeaking || isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>

        <button
          onClick={explainWord}
          disabled={isLoading || isSpeaking}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 font-medium"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
