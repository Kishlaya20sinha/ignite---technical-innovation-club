import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Cursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  useEffect(() => {
    // Add event listeners for hover effects
    const handleMouseEnter = () => setCursorVariant("text");
    const handleMouseLeave = () => setCursorVariant("default");

    const elements = document.querySelectorAll("a, button, h1, h2, p");
    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []); // Note: In a real app with dynamic content, we'd need a more robust way to attach listeners, or use a Context.

  const variants = {
    default: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      height: 40,
      width: 40,
      backgroundColor: "transparent",
      border: "1px solid rgba(249, 115, 22, 0.5)",
    },
    text: {
      x: mousePosition.x - 30,
      y: mousePosition.y - 30,
      height: 60,
      width: 60,
      backgroundColor: "rgba(249, 115, 22, 0.1)",
      border: "1px solid rgba(249, 115, 22, 1)",
      mixBlendMode: "difference" as any,
    }
  };

  const dotVariants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
    },
    text: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
    }
  };

  return (
    <>
      <motion.div
        className="cursor-dot fixed top-0 left-0 bg-primary rounded-full pointer-events-none z-[9999]"
        style={{ width: 8, height: 8 }}
        variants={dotVariants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 1000, damping: 50 }}
      />
      <motion.div
        className="cursor-outline fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </>
  );
};

export default Cursor;
