import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="brand-icon">📈</span>
                <span className="brand-text">Finance Dashboard</span>
            </div>
            <div className="navbar-links">
                <NavLink
                    to="/"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">🎛️</span>
                    Dashboard
                </NavLink>
                <NavLink
                    to="/explorer"
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    <span className="nav-icon">🔍</span>
                    Explorer
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
