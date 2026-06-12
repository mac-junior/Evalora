import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-gray-400 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;