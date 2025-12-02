import { useState, useEffect, useRef } from 'react';
import type { ReaderSettings } from '../types';

interface SettingsPanelProps {
  settings: ReaderSettings;
  updateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  resetSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const fontOptions = [
  { id: 'system', label: 'System', font: 'system-ui' },
  { id: 'lexend', label: 'Lexend', font: 'Lexend' },
  { id: 'opendyslexic', label: 'OpenDyslexic', font: 'OpenDyslexic' },
  { id: 'verdana', label: 'Verdana', font: 'Verdana' },
  { id: 'arial', label: 'Arial', font: 'Arial' },
  { id: 'comic-sans', label: 'Comic Sans', font: 'Comic Sans MS' },
];

// Simple slider with icon
function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  icon,
  color = '#3b82f6',
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  color?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-4">
      <div className="text-gray-400 w-6 flex justify-center">{icon}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          // @ts-ignore
          '--tw-border-opacity': 1,
        }}
      />
    </div>
  );
}

// Toggle button with icon - same size as color buttons
function Toggle({
  checked,
  onChange,
  icon,
  color = '#3b82f6',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        checked ? 'shadow-md' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      style={{
        backgroundColor: checked ? color : undefined,
        color: checked ? 'white' : '#9ca3af',
      }}
    >
      {icon}
    </button>
  );
}

// Font selector dropdown
function FontSelector({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string; font: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-lg bg-gray-50 rounded-2xl cursor-pointer text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
        style={{ fontFamily: current?.font }}
      >
        {current?.label}
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`w-full p-4 text-lg text-left hover:bg-gray-50 transition-colors ${
                opt.id === value ? 'bg-blue-50 text-blue-600' : ''
              }`}
              style={{ fontFamily: opt.font }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Color button
function ColorButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative cursor-pointer">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div
        className="w-12 h-12 rounded-xl border-2 border-gray-200 shadow-sm hover:scale-105 transition-transform"
        style={{ backgroundColor: value }}
      />
    </label>
  );
}

export function SettingsPanel({
  settings,
  updateSetting,
  resetSettings,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <>
      {/* Invisible click-away layer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto" style={{ padding: '3.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Font selector */}
            <FontSelector
              value={settings.fontFamily}
              onChange={(v) => updateSetting('fontFamily', v as ReaderSettings['fontFamily'])}
              options={fontOptions}
            />

            {/* All sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Slider
                icon={<span className="text-xl font-bold">A</span>}
                value={settings.fontSize}
                min={14}
                max={32}
                onChange={(v) => updateSetting('fontSize', v)}
              />
              <Slider
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 5h14M3 10h14M3 15h14" />
                  </svg>
                }
                value={settings.lineHeight}
                min={1.2}
                max={2.5}
                step={0.1}
                onChange={(v) => updateSetting('lineHeight', v)}
              />
              <Slider
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 3v14" />
                    <path d="M8 3h9M8 10h9M8 17h9" strokeWidth={1.5} />
                  </svg>
                }
                value={settings.marginLeft}
                min={5}
                max={30}
                onChange={(v) => updateSetting('marginLeft', v)}
                color="#9ca3af"
              />
              <Slider
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M16 3v14" />
                    <path d="M3 3h9M3 10h9M3 17h9" strokeWidth={1.5} />
                  </svg>
                }
                value={settings.marginRight}
                min={5}
                max={30}
                onChange={(v) => updateSetting('marginRight', v)}
                color="#9ca3af"
              />
            </div>

            {/* Colors */}
            <div className="flex justify-center gap-4">
              <ColorButton
                value={settings.backgroundColor}
                onChange={(v) => updateSetting('backgroundColor', v)}
              />
              <ColorButton
                value={settings.textColor}
                onChange={(v) => updateSetting('textColor', v)}
              />
            </div>

            {/* Feature toggles */}
            <div className="flex justify-center gap-3">
              <Toggle
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                  </svg>
                }
                checked={isFullscreen}
                onChange={toggleFullscreen}
                color="#6b7280"
              />
              <Toggle
                icon={<span className="text-2xl font-black">B</span>}
                checked={settings.bionicReading}
                onChange={(v) => updateSetting('bionicReading', v)}
              />
              <Toggle
                icon={
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="10" width="18" height="4" rx="1" />
                  </svg>
                }
                checked={settings.readingRuler}
                onChange={(v) => updateSetting('readingRuler', v)}
                color="#eab308"
              />
            </div>

            {/* Ruler settings */}
            {settings.readingRuler && (
              <div className="bg-amber-50 rounded-2xl" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Ruler colors */}
                <div className="flex justify-center gap-4">
                  <ColorButton
                    value={settings.rulerColor}
                    onChange={(v) => updateSetting('rulerColor', v)}
                  />
                  <ColorButton
                    value={settings.rulerTextColor}
                    onChange={(v) => updateSetting('rulerTextColor', v)}
                  />
                </div>

                <Slider
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
                    </svg>
                  }
                  value={settings.rulerHeight}
                  min={30}
                  max={80}
                  onChange={(v) => updateSetting('rulerHeight', v)}
                  color="#eab308"
                />
                <Slider
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="8" opacity={0.4} />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  }
                  value={settings.rulerOpacity}
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  onChange={(v) => updateSetting('rulerOpacity', v)}
                  color="#eab308"
                />

                <div className="flex items-center justify-between pt-2">
                  <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 12h16M12 4v16" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <button
                    onClick={() => updateSetting('rulerSnap', !settings.rulerSnap)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.rulerSnap ? 'bg-amber-400' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow mx-1 transition-transform ${
                        settings.rulerSnap ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {settings.rulerSnap && (
                  <Slider
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    }
                    value={settings.rulerSnapOffset}
                    min={-0.5}
                    max={0.5}
                    step={0.05}
                    onChange={(v) => updateSetting('rulerSnapOffset', v)}
                    color="#eab308"
                  />
                )}
              </div>
            )}

            {/* OpenAI API Key */}
            <div className="relative">
              <input
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                placeholder="OpenAI API-nyckel"
                className="w-full p-4 text-base bg-gray-50 rounded-2xl pr-12"
              />
              <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>

          {/* Reset */}
          <div className="p-6 pt-0">
            <button
              onClick={resetSettings}
              className="w-full py-3 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
