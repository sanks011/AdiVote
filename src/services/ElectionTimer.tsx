
import React, { useEffect, useState } from 'react';
import { getElectionSettings } from '../lib/firebase';

const ElectionTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEndDate = async () => {
      try {
        setLoading(true);
        const settings = await getElectionSettings();
        
        if (settings && settings.endDate) {
          const endTime = settings.endDate.toDate();
          const updateTimer = () => {
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();
            
            if (diff <= 0) {
              setTimeRemaining('Ended');
              clearInterval(interval);
            } else {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              
              setTimeRemaining(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
              );
            }
          };
          
          updateTimer();
          const interval = setInterval(updateTimer, 1000);
          return () => clearInterval(interval);
        } else {
          setTimeRemaining('No End Date');
        }
      } catch (error) {
        console.error('Error fetching election end date:', error);
        setTimeRemaining('Error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEndDate();
  }, []);

 
};

export default ElectionTimer;