import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/layouts/Root';
import ApperIcon from '@/components/ApperIcon';

const AccessDeniedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Get message from URL params or use default
  const message = searchParams.get('message') || "You don't have permission to access this page.";

  const handleLogout = async () => {
    await logout();
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="ShieldX" size={40} className="text-secondary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-secondary mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-300 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full px-6 py-3 bg-primary text-surface rounded-lg hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ApperIcon name="ArrowLeft" size={18} />
            Go Back
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-surface border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ApperIcon name="LogOut" size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;