import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all duration-200 ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
