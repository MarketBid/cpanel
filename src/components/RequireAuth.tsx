import { Navigate, useLocation } from 'react-router-dom';

// ...existing imports

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const user = //... logic to determine if user is authenticated

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;