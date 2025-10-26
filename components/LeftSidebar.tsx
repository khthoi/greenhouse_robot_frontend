import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeftSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/send-command', label: 'Gửi lệnh', icon: 'fa-paper-plane' },
    { href: '/temperature-humidity', label: 'Nhiệt độ & Độ ẩm', icon: 'fa-temperature-half' },
    { href: '/obstacle-alert', label: 'Thông báo vật cản', icon: 'fa-triangle-exclamation' },
    { href: '/rfid-info', label: 'Thông tin thẻ từ', icon: 'fa-id-card' },
    { href: '/robot-status', label: 'Trạng thái robot', icon: 'fa-robot' },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <a href="/" className="robot-icon-link">
          <i className="fas fa-robot me-2"></i>
        </a>
        <h5 className="mb-0">IOT Robot</h5>
      </div>
      <nav className="sidebar-nav">
        <ul className="list-unstyled">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              >
                <i className={`fas ${item.icon} me-3`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}