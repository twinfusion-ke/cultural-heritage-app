/**
 * StaggerList — Staggered entrance for list items
 *
 * Each child fades in with increasing delay for a cascade effect.
 */

import React from 'react';
import FadeIn from './FadeIn';

interface StaggerListProps {
  children: React.ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  slideUp?: number;
}

export default function StaggerList({
  children,
  baseDelay = 100,
  staggerDelay = 80,
  slideUp = 24,
}: StaggerListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={baseDelay + index * staggerDelay} slideUp={slideUp}>
          {child}
        </FadeIn>
      ))}
    </>
  );
}
