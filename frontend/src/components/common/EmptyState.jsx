import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = 'No data found', 
  description = '', 
  actionLabel = '', 
  actionLink = '',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm text-center max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && (actionLink || onAction) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;