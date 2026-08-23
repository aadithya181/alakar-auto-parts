import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [] }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-4 md:mb-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-none">
      <Link to="/" className="flex items-center gap-1 hover:text-red-600 transition-colors shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-slate-900 font-semibold truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-red-600 transition-colors truncate max-w-[150px]">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
