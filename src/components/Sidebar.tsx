import { useLocation } from 'react-router-dom';

// ...existing imports

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      {/* ...existing code... */}
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          {item.icon}
          <span className="ml-3">{item.label}</span>
        </Link>
      ))}
      {/* ...existing code... */}
    </div>
  );
};

export default Sidebar;