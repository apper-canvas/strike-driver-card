import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const GameOverModal = ({ score, highScore, isNewHighScore, onRestart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-surface border-2 border-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ApperIcon 
              name="Skull" 
              className="text-secondary mx-auto" 
              size={64} 
            />
          </motion.div>
          
          <div>
            <h2 className="text-4xl font-display font-black text-secondary mb-2">
              MISSION FAILED
            </h2>
            <p className="text-gray-400 font-body">Your aircraft has been destroyed</p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-400 font-body mb-1">FINAL SCORE</div>
              <div className="text-5xl font-display font-black text-primary">
                {score.toLocaleString()}
              </div>
            </div>
            
            {isNewHighScore && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent rounded-lg p-3"
              >
                <div className="flex items-center justify-center gap-2 text-accent font-display font-bold">
                  <ApperIcon name="Trophy" size={24} />
                  <span>NEW HIGH SCORE!</span>
                </div>
              </motion.div>
            )}
            
            {!isNewHighScore && highScore > 0 && (
              <div className="pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-500 font-body mb-1">HIGH SCORE</div>
                <div className="text-2xl font-display font-bold text-accent">
                  {highScore.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onRestart}
              className="w-full"
            >
              <ApperIcon name="RotateCcw" className="inline mr-2" size={20} />
              RETRY MISSION
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverModal;