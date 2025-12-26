import React from 'react';

interface SelectionCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: (id: string) => void;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ 
  id, 
  label, 
  description, 
  icon,
  selected, 
  onClick 
}) => {
  return (
    <div 
      onClick={() => onClick(id)}
      className={`
        relative flex flex-col items-center justify-between p-4 rounded-2xl cursor-pointer h-full
        neu-transition select-none
        ${selected 
          ? 'shadow-neu-pressed-sm bg-background text-primary' 
          : 'shadow-neu-flat-sm bg-background hover:-translate-y-1 hover:shadow-neu-flat text-gray-500'
        }
      `}
    >
      <div className={`mb-3 mt-2 ${selected ? 'text-primary scale-110 transform transition-transform' : 'text-gray-400'}`}>
          {icon}
      </div>

      <div className="text-center w-full">
        <h3 className={`font-bold text-sm ${selected ? 'text-primary' : 'text-gray-600'}`}>
            {label}
        </h3>
        {description && (
            <p className={`text-xs mt-2 font-light line-clamp-2 ${selected ? 'text-violet-400' : 'text-gray-400'}`}>
            {description}
            </p>
        )}
      </div>
    </div>
  );
};