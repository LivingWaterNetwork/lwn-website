"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

/** Small piece of state a page can wire up to its photo grid. */
export function useLightbox() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return { activeIndex, open: setActiveIndex, close: () => setActiveIndex(null) };
}

interface LightboxProps {
  images: LightboxImage[];
  activeIndex: number | null;
  onClose: () => void;
}

export function Lightbox({ images, activeIndex, onClose }: LightboxProps) {
  useEffect(() => {
    if (activeIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, onClose]);

  const image = activeIndex !== null ? images[activeIndex] : null;

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/90 backdrop-blur-sm p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={image.alt}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl aspect-[4/3] rounded-xl overflow-hidden"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            {image.caption && (
              <p className="absolute inset-x-0 bottom-0 bg-navy-dark/80 p-3 text-center text-sm font-sans text-white">
                {image.caption}
              </p>
            )}
          </motion.div>
          <button
            type="button"
            className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white sm:right-6 sm:top-6"
            onClick={onClose}
            aria-label="Close image"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
