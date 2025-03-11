
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  getAllCandidates, 
  addCandidate, 
  updateCandidate, 
  deleteCandidate,
  Candidate
} from '../../lib/firebase';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const fetchedCandidates = await getAllCandidates();
      setCandidates(fetchedCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPosition('');
    setBio('');
    setEditingCandidate(null);
  };

  const handleOpenDialog = (candidate?: Candidate) => {
    resetForm();
    
    if (candidate) {
      setEditingCandidate(candidate);
      setName(candidate.name);
      setPosition(candidate.position);
      setBio(candidate.bio);
    }
    
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !position || !bio) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const candidateData: Candidate = {
        name,
        position,
        bio,
        photoURL: '/placeholder.svg' // Use a default placeholder image
      };
      
      if (editingCandidate && editingCandidate.id) {
        // Update existing candidate
        await updateCandidate(editingCandidate.id, candidateData);
        toast.success('Candidate updated successfully');
      } else {
        // Add new candidate
        await addCandidate(candidateData);
        toast.success('Candidate added successfully');
      }
      
      setDialogOpen(false);
      fetchCandidates();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Failed to save candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return;
    }
    
    try {
      await deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Candidates</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No candidates added yet
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>{candidate.votes || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(candidate)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => candidate.id && handleDeleteCandidate(candidate.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input 
                id="position" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                disabled={isSubmitting}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Candidate'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateManager;