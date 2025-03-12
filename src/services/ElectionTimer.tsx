
import React, { useEffect } from 'react';
import { 
  getElectionSettings, 
  updateElectionSettings,
  getAllCandidates
} from '../lib/firebase';
import { toast } from 'sonner';

// This component doesn't render anything, it just sets up the timer
const ElectionTimer: React.FC = () => {
  useEffect(() => {
    let timerInterval: number;
    
    const checkElectionStatus = async () => {
      try {
        const settings = await getElectionSettings();
        
        if (!settings) return;
        
        // If voting is already disabled, no need to check
        if (!settings.votingEnabled) return;
        
        // Check if end date exists and has passed
        if (settings.endDate) {
          const endTime = settings.endDate.toDate();
          const now = new Date();
          
          if (now >= endTime) {
            // Time's up, close the election and announce winner
            await updateElectionSettings({ 
              votingEnabled: false,
              resultsVisible: true 
            });
            
            // Find the winner
            const candidates = await getAllCandidates();
            if (candidates.length > 0) {
              const winner = candidates.reduce((prev, current) => 
                (prev.votes || 0) > (current.votes || 0) ? prev : current
              );
              
              toast.success(`Election has ended! ${winner.name} is the winner with ${winner.votes || 0} votes.`);
            } else {
              toast.info('Election has ended! No candidates were found.');
            }
          }
        }
      } catch (error) {
        console.error('Error checking election status:', error);
      }
    };
    
    // Check immediately on mount
    checkElectionStatus();
    
    // Set up a timer to check every minute
    timerInterval = window.setInterval(checkElectionStatus, 60000);
    
    return () => {
      window.clearInterval(timerInterval);
    };
  }, []);
  
  return null;
};

export default ElectionTimer;