import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="page home-page">
        <div className="hero">
          <h1>Welcome back, {user.name}!</h1>
          <p>Continue managing your reservations.</p>
          <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-left">
          <p className="landing-subtitle">RESTAURANT RESERVATIONS</p>
          <h1 className="landing-title">Book your table in seconds.</h1>
          <p className="landing-description">
            Reserve a table for any date and time. We'll match you with the right table for your party — no double bookings, no capacity surprises.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              I already have an account
            </Link>
          </div>
        </div>
        <div className="landing-right">
          <div className="restaurant-card">
            <div className="restaurant-card-header">
              <h2 className="restaurant-name">Your Restaurant</h2>
            </div>
            <div className="restaurant-card-body">
              <p className="restaurant-details">Multiple table sizes available</p>
              <p className="restaurant-hours">Easy online booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
