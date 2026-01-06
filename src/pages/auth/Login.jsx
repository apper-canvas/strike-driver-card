import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/layouts/Root';
import { useSelector } from 'react-redux';

function Login() {
  const { isInitialized } = useAuth();
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized) {
      const { ApperUI } = window.ApperSDK;
      if(!user) {
        ApperUI.showLogin("#authentication");
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect');
        navigate(redirectPath ? redirectPath : "/");
      }
    }
  }, [isInitialized]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-surface border border-primary/20 rounded-2xl shadow-2xl">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-r from-primary to-accent text-surface text-2xl 2xl:text-3xl font-bold">
            S
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="text-center text-lg xl:text-xl font-display font-bold text-primary">
              Sky Strike Login
            </div>
            <div className="text-center text-sm text-gray-400">
              Access your pilot account
            </div>
          </div>
        </div>
        <div id="authentication" />
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;