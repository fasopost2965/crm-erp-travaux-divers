import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({
  title,
  breadcrumb = [],
  actions = null
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs font-medium text-slate-400 mb-1.5">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
              Atlas Works
            </Link>
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-300">/</span>
                {item.path ? (
                  <Link to={item.path} className="hover:text-blue-600 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-500 font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
      </div>

      {actions && (
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
