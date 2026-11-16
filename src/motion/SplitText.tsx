import React from 'react';
import { motion } from 'framer-motion';
import { DURATIONS, HAYAT_EASE } from './config';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface SplitTextSegment {
  text: string;
  className?: string;
}

interface SplitTextProps {
  segments: SplitTextSegment[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  stagger?: number;
  delay?: number;
}

export const SplitText: React.FC<SplitTextProps> = ({
  segments,
  as = 'h1',
  className = '',
  stagger = 0.045,
  delay = 0.05,
}) => {
  const reduced = usePrefersReducedMotion();
  const fullPlainText = segments.map(s => s.text).join('');

  // Split each segment into words preserving spaces, grouped cleanly
  const wordsWithStyle: { word: string; isSpace: boolean; segClass?: string }[] = [];
  segments.forEach(seg => {
    const parts = seg.text.split(/(\s+)/);
    parts.forEach(part => {
      if (!part) return;
      wordsWithStyle.push({
        word: part,
        isSpace: /^\s+$/.test(part),
        segClass: seg.className,
      });
    });
  });

  const Tag = as;

  if (reduced) {
    return (
      <Tag className={className}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {segments.map((seg, i) => (
            <span key={i} className={seg.className}>
              {seg.text}
            </span>
          ))}
        </motion.span>
      </Tag>
    );
  }

  let wordIdx = 0;

  return (
    <Tag className={className} aria-label={fullPlainText}>
      {/* Single unbroken text node for screen readers */}
      <span className="sr-only">{fullPlainText}</span>

      {/* Visual staggered word reveal hidden from screen readers */}
      <span aria-hidden="true" className="inline">
        {wordsWithStyle.map((item, idx) => {
          if (item.isSpace) {
            return <React.Fragment key={`sp-${idx}`}> </React.Fragment>;
          }
          const currentWordDelay = delay + wordIdx * stagger;
          wordIdx++;
          return (
            <span
              key={`w-${idx}`}
              className="inline-block overflow-hidden align-bottom pb-[0.06em] -mb-[0.06em]"
            >
              <motion.span
                className={`inline-block ${item.segClass || ''}`}
                initial={{ opacity: 0, y: '0.6em' }}
                animate={{ opacity: 1, y: '0em' }}
                transition={{
                  duration: DURATIONS.base,
                  delay: Math.min(currentWordDelay, 0.55),
                  ease: HAYAT_EASE,
                }}
              >
                {item.word}
              </motion.span>
            </span>
          );
        })}
      </span>
    </Tag>
  );
};
