import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  breadcrumb = [], // ex: [{ label: "CRM", path: "/dashboard/accounts" }, { label: "Détails" }]
  actions = null 
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        {/* Breadcrumbs */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
            <Link to="/dashboard" className="hover:text-blue-500 transition-colors">
              Atlas Works
            </Link>
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                {item.path ? (
                  <Link to={item.path} className="hover:text-blue-500 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-550 dark:text-slate-400 font-medium">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Page Title */}
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Quick Actions Slot */}
      {actions && (
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
