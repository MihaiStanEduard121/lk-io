import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DonateButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            to="/donations"
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-5 rounded-full shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            aria-label="Donate"
          >
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
            <span>Donează</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
