import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

export const Reveal = ({ children, width = '100%', delay = 0.25 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: 'relative', width }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};
