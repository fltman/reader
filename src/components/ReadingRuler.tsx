import { useState, useEffect, useCallback } from 'react';

interface ReadingRulerProps {
  color: string;
  opacity: number;
  height: number;
  snap: boolean;
  snapOffset: number;
  lineHeight: number;
  fontSize: number;
  textColor: string;
}

export function ReadingRuler({ color, opacity, height, snap, snapOffset, lineHeight, fontSize, textColor }: ReadingRulerProps) {
  const [position, setPosition] = useState({ y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [altPressed, setAltPressed] = useState(false);

  // Track Alt key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setAltPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Calculate actual line height in pixels
  const lineHeightPx = fontSize * lineHeight;

  // Snap scroll to align text with ruler
  const snapToLine = useCallback(() => {
    if (!snap) return;

    const rulerY = position.y;
    const scrollY = window.scrollY;
    const contentTop = window.innerHeight - 56; // padding-top of main content (100vh - 56px for header)

    // Offset to center text in the ruler
    const textCenterOffset = lineHeightPx * snapOffset;

    // Calculate which line should be at the ruler position
    const relativeY = rulerY + scrollY - contentTop + textCenterOffset;
    const currentLine = Math.round(relativeY / lineHeightPx);
    const targetScrollY = currentLine * lineHeightPx + contentTop - rulerY - textCenterOffset;

    // Smooth scroll to snap position
    window.scrollTo({
      top: Math.max(0, targetScrollY),
      behavior: 'smooth',
    });
  }, [snap, position.y, lineHeightPx, snapOffset]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({ y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle keyboard navigation with snap
  useEffect(() => {
    if (!snap) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const newScrollY = window.scrollY + direction * lineHeightPx;
        window.scrollTo({
          top: Math.max(0, newScrollY),
          behavior: 'smooth',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snap, lineHeightPx]);

  // Snap after scroll ends
  useEffect(() => {
    if (!snap) return;

    let scrollTimeout: number;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        snapToLine();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [snap, snapToLine]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 0';
  };

  // Update CSS custom properties for ruler position
  useEffect(() => {
    document.documentElement.style.setProperty('--ruler-top', `${position.y - height / 2}px`);
    document.documentElement.style.setProperty('--ruler-bottom', `${position.y + height / 2}px`);
    document.documentElement.style.setProperty('--ruler-text-color', textColor);
  }, [position.y, height, textColor]);

  return (
    <>
      <div
        className="fixed left-0 right-0 cursor-grab active:cursor-grabbing"
        style={{
          top: position.y - height / 2,
          height: height,
          backgroundColor: `rgba(${hexToRgb(color)}, ${opacity})`,
          zIndex: 1,
          mixBlendMode: 'multiply',
          pointerEvents: altPressed ? 'none' : 'auto',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      />
    </>
  );
}
