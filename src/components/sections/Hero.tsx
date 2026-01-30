"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useState, useEffect } from "react";

function TypewriterPill() {
  const staticText = "quando ";
  const words = ["vuoi", "puoi", "ti serve"];
  const wordWithIcon = 2; // Index of "serve" - will show heart icon
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialTyping, setIsInitialTyping] = useState(true);
  const [initialStaticChars, setInitialStaticChars] = useState(0);

  const currentWord = words[currentWordIndex];
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseAfterWord = 2000;
  const pauseAfterDelete = 300;

  // Initial typing animation for "quando "
  useEffect(() => {
    if (isInitialTyping && initialStaticChars < staticText.length) {
      const timeout = setTimeout(() => {
        setInitialStaticChars(prev => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isInitialTyping && initialStaticChars >= staticText.length) {
      setIsInitialTyping(false);
    }
  }, [isInitialTyping, initialStaticChars]);

  // Main typing/deleting animation for dynamic words
  useEffect(() => {
    if (isInitialTyping) return;

    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing
      if (displayedChars < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedChars(prev => prev + 1);
        }, typingSpeed);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseAfterWord);
      }
    } else {
      // Deleting
      if (displayedChars > 0) {
        timeout = setTimeout(() => {
          setDisplayedChars(prev => prev - 1);
        }, deletingSpeed);
      } else {
        // Finished deleting, switch word and start typing
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentWordIndex(prev => (prev + 1) % words.length);
        }, pauseAfterDelete);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedChars, isDeleting, currentWord, isInitialTyping]);

  const displayedStaticText = isInitialTyping
    ? staticText.slice(0, initialStaticChars)
    : staticText;
  const displayedDynamicText = currentWord.slice(0, displayedChars);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.5 }}
      className="inline-flex items-center bg-white text-[var(--brand)] px-3 md:px-6 py-1 rounded-full whitespace-nowrap transition-all duration-200 ease-out"
    >
      {displayedStaticText.split("").map((char, index) => (
        <span key={`static-${index}`} className="inline-block whitespace-pre">
          {char}
        </span>
      ))}
      {displayedDynamicText.split("").map((char, index) => (
        <span key={`dynamic-${index}`} className="inline-block whitespace-pre">
          {char}
        </span>
      ))}
      {/* Heart icon for "serve" */}
      {currentWordIndex === wordWithIcon && displayedChars === currentWord.length && !isDeleting && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-flex items-center ml-1"
        >
          <Heart className="w-7 h-7 md:w-[0.85em] md:h-[0.85em]" fill="currentColor" />
        </motion.span>
      )}
      {/* Blinking cursor - hide when word is complete */}
      {!(displayedChars === currentWord.length && !isDeleting && !isInitialTyping) && (
        <motion.span
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            times: [0, 0.5, 0.5, 1],
          }}
          className="inline-block w-[3px] h-[1em] bg-[var(--brand)] ml-0.5"
        />
      )}
    </motion.span>
  );
}

export function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden min-h-screen">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/50852376-scaled.png')",
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
            Fitness per te 24/7
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white mb-6 px-2 flex flex-col md:flex-row md:flex-nowrap items-center justify-center gap-2 md:gap-4"
          >
            <span>Allenati</span>
            <TypewriterPill />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto"
          >
            <span className="font-bold">24/7, ogni giorno. Anche a Natale.</span><br />La libertà di allenarti senza orari, senza limiti.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/onboarding" className="btn btn-primary">
              Iscriviti ora
              <ArrowRight size={18} />
            </Link>
            <Link href="/palestre" className="btn btn-secondary">
              Scopri i club
            </Link>
          </motion.div>
        </div>
      </div>

          </section>
  );
}
