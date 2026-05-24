// pages/app/NotFound.jsx
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/app/dashboard"><Button><Home className="w-4 h-4" /> Dashboard</Button></Link>
          <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4" /> Home</Button></Link>
        </div>
      </div>
    </div>
  );
};