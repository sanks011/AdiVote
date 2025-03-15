import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  getElectionSettings, 
  updateElectionSettings,
  ElectionSettings,
  Timestamp,
  getClassElectionSettings,
  updateClassElectionSettings,
  resetClassVotes,
  updateElectionStatusRealtime
} from '../../lib/firebase';
import { toast } from 'sonner';
import { 
  Loader2, 
  Timer, 
  Power, 
  Eye, 
  Calendar, 
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  School
} from 'lucide-react';
import ClassSelector from './ClassSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ClassElectionSettings extends ElectionSettings {
  classId: string;
}

const ElectionControl = () => {
  const [settings, setSettings] = useState<ClassElectionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  // Timer check interval
  useEffect(() => {
    const checkTimer = async () => {
      if (!settings || !settings.startDate || !settings.endDate) return;

      const now = new Date();
      const startTime = settings.startDate.toDate();
      const endTime = settings.endDate.toDate();

      // Auto-start voting
      if (now >= startTime && now < endTime && !settings.votingEnabled) {
        await handleVotingToggle(true);
      }
      
      // Auto-end voting and show results
      if (now >= endTime && settings.votingEnabled) {
        await handleVotingToggle(false);
        await handleResultsToggle(true);
      }

      // Update time remaining
      if (now < startTime) {
        updateTimeRemaining(startTime);
      } else if (now < endTime) {
        updateTimeRemaining(endTime);
      }
    };

    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');

        if (!selectedClassId) {
          setSettings(null);
          setLoading(false);
          return;
        }

        const classSettings = await getClassElectionSettings(selectedClassId);
        setSettings(classSettings);

        // Set form values
        if (classSettings.startDate) {
          const startDateTime = classSettings.startDate.toDate();
          setStartDate(startDateTime.toISOString().split('T')[0]);
          setStartTime(startDateTime.toTimeString().slice(0, 5));
        }

        if (classSettings.endDate) {
          const endDateTime = classSettings.endDate.toDate();
          setEndDate(endDateTime.toISOString().split('T')[0]);
          setEndTime(endDateTime.toTimeString().slice(0, 5));
        }

        // Calculate progress
        const now = new Date();
        if (classSettings.startDate && classSettings.endDate) {
          const start = classSettings.startDate.toDate();
          const end = classSettings.endDate.toDate();
          const total = end.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          
          if (now < start) {
            setProgress(0);
          } else if (now > end) {
            setProgress(100);
          } else {
            setProgress(Math.round((elapsed / total) * 100));
          }
        }
      } catch (error) {
        console.error('Error fetching election settings:', error);
        setError('Failed to load election settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedClassId]);

  const updateTimeRemaining = (endDateTime: Date) => {
    const now = new Date();
    const diff = endDateTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Ended');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeRemaining(
      `${days}d ${hours}h ${minutes}m ${seconds}s`
    );
  };

  const handleVotingToggle = async (enabled: boolean) => {
    try {
      setUpdating(true);
      setError('');
      
      if (!selectedClassId) {
        toast.error('Please select a class first');
        return;
      }
      
      // Update both Firestore and Realtime Database
      await Promise.all([
        updateClassElectionSettings(selectedClassId, { votingEnabled: enabled }),
        updateElectionStatusRealtime(selectedClassId, { 
          votingEnabled: enabled,
          startDate: settings?.startDate,
          endDate: settings?.endDate
        })
      ]);
      
      setSettings(prev => prev ? { ...prev, votingEnabled: enabled } : null);
      toast.success(`Voting ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling voting:', error);
      setError('Failed to toggle voting status');
    } finally {
      setUpdating(false);
    }
  };

  const handleResultsToggle = async (visible: boolean) => {
    try {
      setUpdating(true);
      setError('');
      
      if (!selectedClassId) {
        toast.error('Please select a class first');
        return;
      }
      
      // Update both Firestore and Realtime Database
      await Promise.all([
        updateClassElectionSettings(selectedClassId, { resultsVisible: visible }),
        updateElectionStatusRealtime(selectedClassId, { 
          resultsVisible: visible,
          startDate: settings?.startDate,
          endDate: settings?.endDate
        })
      ]);
      
      setSettings(prev => prev ? { ...prev, resultsVisible: visible } : null);
      toast.success(`Results ${visible ? 'shown' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error toggling results:', error);
      setError('Failed to toggle results visibility');
    } finally {
      setUpdating(false);
    }
  };

  const handleTimeUpdate = async () => {
    try {
      setUpdating(true);
      setError('');
      
      if (!selectedClassId) {
        toast.error('Please select a class first');
        return;
      }
      
      if (!startDate || !startTime || !endDate || !endTime) {
        toast.error('Please fill in all date and time fields');
        return;
      }
      
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }
      
      const now = new Date();
      if (startDateTime < now) {
        toast.error('Start time must be in the future');
        return;
      }
      
      const updates = {
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(endDateTime)
      };
      
      // Update both Firestore and Realtime Database
      await Promise.all([
        updateClassElectionSettings(selectedClassId, updates),
        updateElectionStatusRealtime(selectedClassId, {
          ...updates,
          votingEnabled: settings?.votingEnabled,
          resultsVisible: settings?.resultsVisible
        })
      ]);
      
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Election schedule updated successfully');
    } catch (error) {
      console.error('Error updating time:', error);
      setError('Failed to update election schedule');
    } finally {
      setUpdating(false);
    }
  };

  const handleResetElection = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class first');
      return;
    }

    try {
      setUpdating(true);

      // Reset votes
      await resetClassVotes(selectedClassId);

      // Reset settings
      await updateClassElectionSettings(selectedClassId, {
        votingEnabled: false,
        resultsVisible: false,
        startDate: null,
        endDate: null
      });

      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        votingEnabled: false,
        resultsVisible: false,
        startDate: null,
        endDate: null
      } : null);

      // Reset form values
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setProgress(0);

      toast.success('Election has been reset successfully');
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
        <Loader2 className="h-8 w-8 animate-spin text-[#33CC33]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Election Control</h2>
          <p className="text-sm text-gray-500">Manage voting settings and election timeline</p>
        </div>
        
        <ClassSelector 
          selectedClassId={selectedClassId} 
          setSelectedClassId={setSelectedClassId}
          label="Select Class to Control" 
        />
      </div>
      
      {!selectedClassId ? (
        <Alert className="bg-yellow-50 border-yellow-200">
          <School className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            Please select a class to manage its election settings
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Progress Bar */}
          <Card className="p-4">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className={step >= 1 ? 'text-primary font-medium' : 'text-gray-500'}>1. Select Class</div>
              <div className={step >= 2 ? 'text-primary font-medium' : 'text-gray-500'}>2. Set Schedule</div>
              <div className={step >= 3 ? 'text-primary font-medium' : 'text-gray-500'}>3. Control Voting</div>
              <div className={step >= 4 ? 'text-primary font-medium' : 'text-gray-500'}>4. Show Results</div>
            </div>
          </Card>
          
          <div className="grid gap-6">
            {/* Schedule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-[#33CC33]/20">
                <CardHeader className="bg-gradient-to-r from-[#33CC33]/5 to-[#2ecc71]/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-[#33CC33]" />
                    Election Schedule
                  </CardTitle>
                  <CardDescription>
                    Set the start and end times for the election
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-[#33CC33]/20 focus-visible:ring-[#33CC33]/20"
                          disabled={settings?.votingEnabled}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="border-[#33CC33]/20 focus-visible:ring-[#33CC33]/20"
                          disabled={settings?.votingEnabled}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          className="border-[#33CC33]/20 focus-visible:ring-[#33CC33]/20"
                          disabled={settings?.votingEnabled}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="border-[#33CC33]/20 focus-visible:ring-[#33CC33]/20"
                          disabled={settings?.votingEnabled}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleTimeUpdate}
                      disabled={updating || !startDate || !startTime || !endDate || !endTime || settings?.votingEnabled}
                      className="w-full bg-gradient-to-r from-[#33CC33] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#33CC33] text-white"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Set Election Schedule
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Voting Control Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-[#33CC33]/20">
                <CardHeader className="bg-gradient-to-r from-[#33CC33]/5 to-[#2ecc71]/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Power className="h-5 w-5 text-[#33CC33]" />
                    Voting Control
                  </CardTitle>
                  <CardDescription>
                    Start or stop the voting process
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Timer Display */}
                    {settings?.votingEnabled && timeRemaining && (
                      <div className="p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-[#33CC33]" />
                          <span className="font-medium">Time Remaining</span>
                        </div>
                        <div className="text-2xl font-bold text-[#33CC33]">
                          {timeRemaining}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${settings?.votingEnabled ? 'bg-[#33CC33]' : 'bg-gray-300'}`}>
                          <div className={`h-3 w-3 rounded-full ${settings?.votingEnabled ? 'animate-ping bg-[#33CC33]/50' : ''}`} />
                        </div>
                        <Label className="font-medium">
                          {settings?.votingEnabled ? 'Voting is Active' : 'Voting is Inactive'}
                        </Label>
                      </div>
                      <Switch 
                        checked={settings?.votingEnabled || false}
                        onCheckedChange={handleVotingToggle}
                        disabled={updating || !startDate || !startTime || !endDate || !endTime}
                        className="data-[state=checked]:bg-[#33CC33]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Eye className={`h-5 w-5 ${settings?.resultsVisible ? 'text-[#33CC33]' : 'text-gray-400'}`} />
                        <Label className="font-medium">
                          {settings?.resultsVisible ? 'Results are Visible' : 'Results are Hidden'}
                        </Label>
                      </div>
                      <Switch 
                        checked={settings?.resultsVisible || false}
                        onCheckedChange={handleResultsToggle}
                        disabled={updating || settings?.votingEnabled}
                        className="data-[state=checked]:bg-[#33CC33]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reset Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-destructive/20">
                <CardHeader className="bg-destructive/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Reset Election
                  </CardTitle>
                  <CardDescription>
                    Reset all votes and allow re-voting
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This will delete all votes for this class and allow students to vote again.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    variant="destructive"
                    onClick={handleResetElection}
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Election
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionControl;