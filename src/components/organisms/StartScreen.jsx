import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const StartScreen = ({ onStart, highScore }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="text-center space-y-8 px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <h1 className="text-7xl font-display font-black mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            SKY STRIKE
          </h1>
          <p className="text-xl text-gray-400 font-body">
            Aerial Combat Supremacy
          </p>
        </motion.div>
        
        {highScore > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface/50 backdrop-blur-md rounded-lg p-6 border border-accent/30 inline-block"
          >
            <div className="flex items-center gap-3">
              <ApperIcon name="Trophy" className="text-accent" size={32} />
              <div>
                <div className="text-sm text-gray-400 font-body">HIGH SCORE</div>
                <div className="text-3xl font-display font-bold text-accent">
                  {highScore.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button 
            variant="primary" 
            size="lg" 
            onClick={onStart}
            className="text-2xl px-12 py-5"
          >
            <ApperIcon name="Play" className="inline mr-2" size={28} />
            START MISSION
          </Button>
          
          <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-6 border border-primary/20 max-w-md mx-auto">
            <h3 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <ApperIcon name="Info" size={20} />
              MISSION BRIEFING
            </h3>
            <div className="space-y-3 text-left text-gray-300 font-body">
              <div className="flex items-start gap-3">
                <ApperIcon name="Target" className="text-secondary flex-shrink-0 mt-1" size={20} />
                <p>Eliminate all hostile aircraft in the combat zone</p>
              </div>
              <div className="flex items-start gap-3">
                <ApperIcon name="Zap" className="text-accent flex-shrink-0 mt-1" size={20} />
                <p>Build combos for bonus points and multipliers</p>
              </div>
              <div className="flex items-start gap-3">
                <ApperIcon name="Shield" className="text-primary flex-shrink-0 mt-1" size={20} />
                <p>Avoid enemy collisions to preserve hull integrity</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StartScreen;