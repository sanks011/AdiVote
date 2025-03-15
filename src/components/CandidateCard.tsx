import React from 'react';
import { Candidate } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
  showResults: boolean;
  totalVotes: number;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
  disabled,
  showResults,
  totalVotes
}) => {
  const votePercentage = totalVotes > 0 && candidate.votes 
    ? Math.round((candidate.votes / totalVotes) * 100)
    : 0;
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300
        ${isSelected ? 'ring-2 ring-primary border-transparent' : ''}
        ${!disabled ? 'hover:shadow-md cursor-pointer' : ''}
      `}
      onClick={() => {
        if (!disabled) {
          onSelect();
        }
      }}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}
      
      <div className="mb-4 flex justify-center">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-2xl">{candidate.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      
      <h3 className="text-lg font-semibold text-center">{candidate.name}</h3>
      <p className="mt-1 text-sm text-center text-gray-500">{candidate.position}</p>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 line-clamp-3">{candidate.bio}</p>
      </div>
      
      {showResults && (
        <div className="mt-4">
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${votePercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{candidate.votes} votes</span>
            <span className="text-xs font-medium">{votePercentage}%</span>
          </div>
        </div>
      )}
      
      {!disabled && (
        <Button
          className="w-full mt-4"
          variant={isSelected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      )}
      
      {disabled && !showResults && (
        <div className="mt-4 text-center text-sm text-gray-500">
          You have already voted
        </div>
      )}
    </div>
  );
};

export default CandidateCard;