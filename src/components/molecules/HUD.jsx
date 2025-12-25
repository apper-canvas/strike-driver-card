import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const HUD = ({ score, health, combo, level }) => {
  const healthPercent = (health / 100) * 100;
  const healthColor = health > 50 ? "success" : health > 25 ? "warning" : "error";
  
  return (
    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
      <div className="bg-surface/80 backdrop-blur-md rounded-lg p-4 border border-primary/30">
        <div className="flex items-center gap-3 mb-2">
          <ApperIcon name="Target" className="text-primary" size={24} />
          <div>
            <div className="text-xs text-gray-400 font-body">SCORE</div>
            <div className="text-2xl font-display font-bold text-primary">
              {score.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ApperIcon name="Shield" className="text-accent" size={24} />
          <div>
            <div className="text-xs text-gray-400 font-body">LEVEL</div>
            <div className="text-2xl font-display font-bold text-accent">{level}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-surface/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 min-w-[250px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ApperIcon name="Heart" className={`text-${healthColor}`} size={24} />
            <span className="text-xs text-gray-400 font-body">HULL INTEGRITY</span>
          </div>
          <span className="text-lg font-display font-bold text-white">{health}%</span>
        </div>
        
        <div className="w-full h-3 bg-background rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              health > 50 && "bg-gradient-to-r from-success to-primary",
              health > 25 && health <= 50 && "bg-gradient-to-r from-warning to-accent",
              health <= 25 && "bg-gradient-to-r from-error to-secondary"
            )}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        
        {combo > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ApperIcon name="Zap" className="text-accent animate-pulse" size={20} />
              <span className="text-xs text-gray-400 font-body">COMBO</span>
            </div>
            <span className="text-3xl font-display font-black text-accent animate-pulse">
              {combo}x
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;