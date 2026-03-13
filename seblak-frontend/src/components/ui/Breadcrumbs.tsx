import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-gray-400">/</span>
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-blue-600 hover:text-blue-800">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}