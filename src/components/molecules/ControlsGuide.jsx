import ApperIcon from "@/components/ApperIcon";

const ControlsGuide = () => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-surface/80 backdrop-blur-md rounded-lg p-4 border border-primary/30 pointer-events-none">
      <div className="flex items-center gap-6 text-sm font-body">
<div className="flex items-center gap-2">
          <div className="flex gap-1">
            <kbd className="px-2 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">W</kbd>
            <kbd className="px-2 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">A</kbd>
            <kbd className="px-2 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">S</kbd>
            <kbd className="px-2 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">D</kbd>
          </div>
          <span className="text-gray-300">Movement</span>
        </div>
        
        <div className="flex items-center gap-2">
          <kbd className="px-3 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">
            MOUSE
          </kbd>
          <span className="text-gray-300">Aim & Look</span>
        </div>
        
        <div className="flex items-center gap-2">
          <kbd className="px-3 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">
            LEFT CLICK
          </kbd>
          <span className="text-gray-300">Fire Laser</span>
        </div>
        
        <div className="flex items-center gap-2">
          <kbd className="px-3 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">
            SPACE
          </kbd>
          <span className="text-gray-300">Boost</span>
        </div>
        
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-background rounded border border-primary/50 text-primary font-semibold">
            ESC
          </kbd>
          <span className="text-gray-300">Pause</span>
        </div>
      </div>
    </div>
  );
};

export default ControlsGuide;