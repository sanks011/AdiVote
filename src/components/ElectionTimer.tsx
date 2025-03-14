import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ElectionTimer = () => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>(); // Use useRef for the interval

  const updateTimer = (endDate: Date) => {
    const now = new Date().getTime();
    const distance = endDate.getTime() - now;

    if (distance < 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTimeLeft('Election has ended');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  };

  const fetchEndDate = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'election'));
      const endDate = settingsDoc.data()?.endDate?.toDate();
      
      if (endDate) {
        updateTimer(endDate);
        intervalRef.current = setInterval(() => updateTimer(endDate), 1000);
      }
    } catch (error) {
      console.error('Error fetching election end date:', error);
      setTimeLeft('Error loading timer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndDate();
    
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4 bg-primary/10 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Time Remaining</h3>
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-center p-4 bg-primary/10 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Time Remaining</h3>
      <div className="text-2xl font-bold">{timeLeft}</div>
    </div>
  );
};

export default ElectionTimer;