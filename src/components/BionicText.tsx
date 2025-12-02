import type { ReactElement, MouseEvent } from 'react';

interface BionicTextProps {
  text: string;
  enabled: boolean;
  onWordAltClick?: (word: string, position: { x: number; y: number }) => void;
}

function getBionicWord(word: string): ReactElement {
  if (word.length === 0) return <>{word}</>;

  // Bionic Reading: bold first half of each word
  // Short words (1-3 chars): bold first char only
  // Longer words: bold ~50% (first half)
  let boldLength: number;
  if (word.length <= 3) {
    boldLength = 1;
  } else if (word.length <= 6) {
    boldLength = Math.ceil(word.length * 0.5);
  } else {
    // Longer words: slightly less than half to avoid over-bolding
    boldLength = Math.ceil(word.length * 0.45);
  }

  const boldPart = word.slice(0, boldLength);
  const normalPart = word.slice(boldLength);

  return (
    <>
      <strong className="font-semibold">{boldPart}</strong>
      {normalPart}
    </>
  );
}

interface WordSpanProps {
  word: string;
  bionic: boolean;
  onAltClick?: (word: string, position: { x: number; y: number }) => void;
}

function WordSpan({ word, bionic, onAltClick }: WordSpanProps) {
  const handleClick = (e: MouseEvent) => {
    if (e.altKey && onAltClick) {
      e.preventDefault();
      onAltClick(word, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <span
      onClick={handleClick}
      className={onAltClick ? 'cursor-pointer' : undefined}
    >
      {bionic ? getBionicWord(word) : word}
    </span>
  );
}

export function BionicText({ text, enabled, onWordAltClick }: BionicTextProps) {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, pIndex) => (
        <p key={pIndex} className="mb-4">
          {paragraph.split(/(\s+)/).map((part, index) => {
            // If it's whitespace, render it as-is
            if (/^\s+$/.test(part)) {
              return <span key={index}>{part}</span>;
            }
            // If it's a word, render with click handler
            return (
              <WordSpan
                key={index}
                word={part}
                bionic={enabled}
                onAltClick={onWordAltClick}
              />
            );
          })}
        </p>
      ))}
    </>
  );
}
