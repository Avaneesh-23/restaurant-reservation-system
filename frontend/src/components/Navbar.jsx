import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`navbar ${isAdmin ? 'navbar-admin' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand">
          {isAdmin ? 'Admin Panel' : 'Bistro Reserve'}
        </Link>

        {user && (
          <nav className="nav-links">
            {isAdmin ? (
              <>
                <NavLink to="/admin">Reservations</NavLink>
                <NavLink to="/admin/tables">Tables</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard">My Reservations</NavLink>
                <NavLink to="/book">Book Table</NavLink>
              </>
            )}
            <span className="user-badge">{user.name}</span>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
