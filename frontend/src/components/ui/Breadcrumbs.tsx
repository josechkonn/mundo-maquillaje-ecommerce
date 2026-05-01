import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-p-s text-text-muted mb-8 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link 
        to="/" 
        className="hover:text-brand-500 transition-colors"
      >
        Inicio
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-brand-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-base font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
