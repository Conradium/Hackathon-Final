import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <motion.div 
      className="h-screen flex items-center justify-center text-lg font-semibold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Loading...
    </motion.div>
  );
}
