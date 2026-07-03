import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page home-page">
      <div className="hero">
        <h1>Restaurant Reservation System</h1>
        <p>Book a table online or manage reservations as an administrator.</p>
        {!user ? (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        ) : (
          <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
