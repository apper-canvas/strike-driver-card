import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <ApperIcon name="AlertTriangle" className="text-secondary mx-auto" size={80} />
          <h1 className="text-7xl font-display font-black text-primary">404</h1>
          <h2 className="text-3xl font-display font-bold text-white">Mission Not Found</h2>
          <p className="text-gray-400 font-body text-lg max-w-md mx-auto">
            The coordinates you're looking for don't exist in our database. Return to base immediately.
          </p>
        </div>
        
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => navigate("/")}
          className="text-xl"
        >
          <ApperIcon name="Home" className="inline mr-2" size={24} />
          RETURN TO BASE
        </Button>
      </div>
    </div>
  );
};

export default NotFound;