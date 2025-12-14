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
        relative flex flex-col items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 h-full
        ${selected 
          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
          : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse z-10 shadow-sm border border-white" />
      )}
      
      <div className={`mb-3 mt-2 ${selected ? 'text-primary' : 'text-gray-500'}`}>
          {icon}
      </div>

      <div className="text-center w-full">
        <h3 className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-gray-800'}`}>
            {label}
        </h3>
        {description && (
            <p className="text-xs text-gray-500 mt-1 font-light line-clamp-2">
            {description}
            </p>
        )}
      </div>
    </div>
  );
};