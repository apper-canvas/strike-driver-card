import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const PauseModal = ({ onResume, onQuit }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-40"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border-2 border-primary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center space-y-6">
          <ApperIcon name="Pause" className="text-primary mx-auto" size={56} />
          
          <div>
            <h2 className="text-4xl font-display font-black text-primary mb-2">
              PAUSED
            </h2>
            <p className="text-gray-400 font-body">Mission on hold</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onResume}
              className="w-full"
            >
              <ApperIcon name="Play" className="inline mr-2" size={20} />
              RESUME MISSION
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onQuit}
              className="w-full"
            >
              <ApperIcon name="X" className="inline mr-2" size={20} />
              ABORT MISSION
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PauseModal;