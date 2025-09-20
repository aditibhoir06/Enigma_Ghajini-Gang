import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-card text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Welcome to Government Services Helper</h2>
          <p className="text-muted-foreground">
            Your companion for navigating government schemes, financial advice, and public service reviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-primary hover:opacity-90">
              <Link to="/schemes">
                <Home className="h-4 w-4 mr-2" />
                Go to Schemes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/chatbot">
                Financial Help
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
