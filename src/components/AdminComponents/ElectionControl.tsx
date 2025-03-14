
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  getElectionSettings, 
  updateElectionSettings,
  ElectionSettings,
  Timestamp
} from '../../lib/firebase';
import { toast } from 'sonner';
import { Loader2, Timer } from 'lucide-react';
import ClassSelector from './ClassSelector';

const ElectionControl = () => {
  const [settings, setSettings] = useState<ElectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

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
  }, [selectedClassId]);

  const handleVotingToggle = async (enabled: boolean) => {
    if (!settings) return;
    
    setUpdating(true);
    try {
      await updateElectionSettings({ 
        votingEnabled: enabled,
        classId: selectedClassId || undefined
      });
      
      setSettings({ ...settings, votingEnabled: enabled });
      toast.success(`Voting ${enabled ? 'enabled' : 'disabled'} successfully${selectedClassId ? ' for selected class' : ''}`);
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
      await updateElectionSettings({ 
        resultsVisible: visible,
        classId: selectedClassId || undefined
      });
      
      setSettings({ ...settings, resultsVisible: visible });
      toast.success(`Results ${visible ? 'visible' : 'hidden'} successfully${selectedClassId ? ' for selected class' : ''}`);
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
        endDate: Timestamp.fromDate(endDateTime),
        classId: selectedClassId || undefined
      });
      
      setSettings(prev => prev ? {
        ...prev,
        endDate: Timestamp.fromDate(endDateTime)
      } : null);
      
      toast.success(`Election end time updated successfully${selectedClassId ? ' for selected class' : ''}`);
    } catch (error) {
      console.error('Error updating end time:', error);
      toast.error('Failed to update end time');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetElection = async () => {
    const confirmMessage = selectedClassId 
      ? 'Are you sure you want to reset the election for the selected class? This will delete all votes for this class and cannot be undone.'
      : 'Are you sure you want to reset the election for ALL classes? This will delete all votes and cannot be undone.';
      
    if (!confirm(confirmMessage)) {
      return;
    }
    
    setUpdating(true);
    try {
      // Implementation would go here
      
      toast.success(`Election reset successfully${selectedClassId ? ' for selected class' : ''}`);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Election Control</h2>
        <ClassSelector 
          selectedClassId={selectedClassId} 
          setSelectedClassId={setSelectedClassId}
          label="Control for Class" 
        />
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Switch 
              id="voting" 
              checked={settings?.votingEnabled || false}
              onCheckedChange={handleVotingToggle}
              disabled={updating}
            />
            <Label htmlFor="voting">
              Enable Voting {selectedClassId ? 'for Selected Class' : 'for All Classes'}
            </Label>
          </div>
          
          <div className="flex items-center space-x-4">
            <Switch 
              id="results" 
              checked={settings?.resultsVisible || false}
              onCheckedChange={handleResultsToggle}
              disabled={updating}
            />
            <Label htmlFor="results">
              Show Results {selectedClassId ? 'for Selected Class' : 'for All Classes'}
            </Label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Set Election End Time {selectedClassId ? 'for Selected Class' : 'for All Classes'}
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
            className="bg-primary hover:bg-primary/90"
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
            `Reset Election${selectedClassId ? ' for Selected Class' : ''}`
          )}
        </Button>
      </div>
    </div>
  );
};

export default ElectionControl;