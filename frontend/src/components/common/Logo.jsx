import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Logo = ({ to = '/', size = 'default', showText = true }) => {
  const sizeClasses = {
    small: 'w-7 h-7',
    default: 'w-9 h-9',
    large: 'w-10 h-10',
  };

  const textSizes = {
    small: 'text-base',
    default: 'text-xl',
    large: 'text-2xl',
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 22,
  };

  return (
    <Link to={to} className="flex items-center gap-3">
      <div 
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}
        style={{ backgroundColor: '#5C3D2E' }}
      >
        <img 
          src="/logo.png" 
          alt="Evalora" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <GraduationCap 
          className="text-white" 
          size={iconSizes[size]}
        />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-[#3E2F24] tracking-tight`}>
          Evalora
        </span>
      )}
    </Link>
  );
};

export default Logo;