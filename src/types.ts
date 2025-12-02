export interface ReaderSettings {
  // Colors
  backgroundColor: string;
  textColor: string;
  rulerTextColor: string;

  // Typography
  fontFamily: 'system' | 'serif' | 'opendyslexic' | 'lexend' | 'verdana' | 'arial' | 'comic-sans';
  fontSize: number;
  lineHeight: number;

  // Margins
  marginLeft: number;
  marginRight: number;

  // Bionic Reading
  bionicReading: boolean;

  // Reading Ruler
  readingRuler: boolean;
  rulerColor: string;
  rulerOpacity: number;
  rulerHeight: number;
  rulerSnap: boolean;
  rulerSnapOffset: number;

  // OpenAI
  openaiApiKey: string;
}

export const defaultSettings: ReaderSettings = {
  backgroundColor: '#fffef0',
  textColor: '#333333',
  rulerTextColor: '#000000',
  fontFamily: 'system',
  fontSize: 18,
  lineHeight: 1.8,
  marginLeft: 15,
  marginRight: 15,
  bionicReading: false,
  readingRuler: false,
  rulerColor: '#ffff00',
  rulerOpacity: 0.3,
  rulerHeight: 40,
  rulerSnap: false,
  rulerSnapOffset: -0.5,
  openaiApiKey: '',
};

export const fontFamilyMap: Record<ReaderSettings['fontFamily'], string> = {
  'system': 'system-ui, -apple-system, sans-serif',
  'lexend': 'Lexend, sans-serif',
  'opendyslexic': 'OpenDyslexic, sans-serif',
  'verdana': 'Verdana, Geneva, sans-serif',
  'arial': 'Arial, Helvetica, sans-serif',
  'serif': 'Georgia, "Times New Roman", serif',
  'comic-sans': '"Comic Sans MS", cursive',
};
