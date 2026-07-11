"use client";
import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px" } = options;
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, isRevealed };
}

// Hook para revelar múltiples elementos con delay
export function useScrollRevealMultiple(count: number, baseDelay: number = 100) {
  const [revealed, setRevealed] = useState<boolean[]>(new Array(count).fill(false));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Revelar elementos uno por uno con delay
            for (let i = 0; i < count; i++) {
              setTimeout(() => {
                setRevealed((prev) => {
                  const newState = [...prev];
                  newState[i] = true;
                  return newState;
                });
              }, i * baseDelay);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [count, baseDelay]);

  return { containerRef, revealed };
}
