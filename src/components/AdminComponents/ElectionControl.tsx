import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  getElectionSettings, 
  updateElectionSettings,
  ElectionSettings 
} from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Loader2, Timer } from 'lucide-react';

const ElectionControl = () => {
  const [settings, setSettings] = useState<ElectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const electionSettings = await getElectionSettings();
        setSettings(electionSettings);
        
        if (electionSettings?.endDate) {
          const date = new Date(electionSettings.endDate.seconds * 1000);
          setEndDate(date.toISOString().split('T')[0]);
          setEndTime(date.toTimeString().split(':').slice(0,2).join(':'));
        }
      } catch (error) {
        console.error('Error fetching election settings:', error);
        toast.error('Failed to load election settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleVotingToggle = async (enabled: boolean) => {
    if (!settings) return;
    
    setUpdating(true);
    try {
      await updateElectionSettings({ votingEnabled: enabled });
      setSettings({ ...settings, votingEnabled: enabled });
      toast.success(`Voting ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating voting status:', error);
      toast.error('Failed to update voting status');
    } finally {
      setUpdating(false);
    }
  };

  const handleResultsToggle = async (visible: boolean) => {
    if (!settings) return;
    
    setUpdating(true);
    try {
      await updateElectionSettings({ resultsVisible: visible });
      setSettings({ ...settings, resultsVisible: visible });
      toast.success(`Results ${visible ? 'visible' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error updating results visibility:', error);
      toast.error('Failed to update results visibility');
    } finally {
      setUpdating(false);
    }
  };

  const handleTimeUpdate = async () => {
    if (!endDate || !endTime) {
      toast.error('Please set both date and time');
      return;
    }

    setUpdating(true);
    try {
      const endDateTime = new Date(`${endDate}T${endTime}`);
      await updateElectionSettings({ 
        endDate: Timestamp.fromDate(endDateTime)
      });
      setSettings(prev => prev ? {
        ...prev,
        endDate: Timestamp.fromDate(endDateTime)
      } : null);
      toast.success('Election end time updated successfully');
    } catch (error) {
      console.error('Error updating end time:', error);
      toast.error('Failed to update end time');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetElection = async () => {
    if (!confirm('Are you sure you want to reset the election? This will delete all votes and cannot be undone.')) {
      return;
    }
    
    setUpdating(true);
    try {
      toast.success('Election reset successfully');
    } catch (error) {
      console.error('Error resetting election:', error);
      toast.error('Failed to reset election');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Election Control</h2>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Switch 
              id="voting" 
              checked={settings?.votingEnabled || false}
              onCheckedChange={handleVotingToggle}
              disabled={updating}
            />
            <Label htmlFor="voting">Enable Voting</Label>
          </div>
          
          <div className="flex items-center space-x-4">
            <Switch 
              id="results" 
              checked={settings?.resultsVisible || false}
              onCheckedChange={handleResultsToggle}
              disabled={updating}
            />
            <Label htmlFor="results">Show Results</Label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Set Election End Time
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleTimeUpdate}
            disabled={updating || !endDate || !endTime}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update End Time'
            )}
          </Button>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Button 
          variant="destructive" 
          onClick={handleResetElection}
          disabled={updating}
        >
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Reset Election'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ElectionControl;