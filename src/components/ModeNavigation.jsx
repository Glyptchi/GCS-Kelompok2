import { NavLink } from 'react-router-dom';

export default function ModeNavigation() {
  return (
    <nav className="mode-navigation" aria-label="Mode GCS">
      <NavLink to="/" end>Plan</NavLink>
      <NavLink to="/fly">Fly</NavLink>
      <NavLink to="/simulator">Simulator</NavLink>
    </nav>
  );
}
