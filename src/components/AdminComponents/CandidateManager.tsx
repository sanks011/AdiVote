import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Image, AlertCircle, Check, X, Loader2, School, Users } from 'lucide-react';
import { toast } from 'sonner';
import { 
  addCandidate, 
  deleteCandidate, 
  updateCandidate, 
  getClassCandidates, 
  getAllCandidates,
  getAllClasses
} from '../../lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImageUpload from './ImageUpload';

interface Candidate {
  id?: string;
  name: string;
  position: string;
  bio: string;
  photoURL: string;
  classId?: string;
  votes?: number;
}

const CandidateManager = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('/placeholder.svg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  useEffect(() => {
    loadClasses();
  }, []);
  
  useEffect(() => {
    if (selectedClass) {
      loadCandidates();
    } else {
      loadAllCandidates();
    }
  }, [selectedClass]);
  
  const loadClasses = async () => {
    try {
      const allClasses = await getAllClasses();
      setClasses(allClasses);
      
      // If there's only one class, select it automatically
      if (allClasses.length === 1) {
        setSelectedClass(allClasses[0].id);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    }
  };
  
  const loadCandidates = async () => {
    try {
      setLoading(true);
      
      if (!selectedClass) {
        setCandidates([]);
        return;
      }
      
      const candidatesList = await getClassCandidates(selectedClass);
      setCandidates(candidatesList);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };
  
  const loadAllCandidates = async () => {
    try {
      setLoading(true);
      const allCandidates = await getAllCandidates();
      setCandidates(allCandidates);
    } catch (error) {
      console.error('Error loading all candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectClass = (classId: string) => {
    setSelectedClass(classId === 'all' ? null : classId);
  };
  
  const handleAddClick = () => {
    // Reset form
    setName('');
    setPosition('');
    setBio('');
    setClassId(selectedClass);
    setUploadedImageUrl('/placeholder.svg');
    setEditMode(false);
    setCurrentId(null);
    setModalOpen(true);
  };
  
  const handleEditClick = (candidate: Candidate) => {
    setName(candidate.name);
    setPosition(candidate.position);
    setBio(candidate.bio || '');
    setClassId(candidate.classId || null);
    setUploadedImageUrl(candidate.photoURL || '/placeholder.svg');
    setEditMode(true);
    setCurrentId(candidate.id);
    setModalOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAddOrEditCandidate = async () => {
    if (!name || !position) {
      toast.error('Name and position are required');
      return;
    }
    
    if (!classId) {
      toast.error('Please select a class for the candidate');
      return;
    }
    
    if (!uploadedImageUrl || uploadedImageUrl === '/placeholder.svg') {
      toast.error('Please upload a candidate photo');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const candidateData = {
        name,
        position,
        bio,
        photoURL: uploadedImageUrl,
        classId
      };
      
      if (editMode && currentId) {
        await updateCandidate(currentId, candidateData);
        toast.success('Candidate updated successfully');
      } else {
        await addCandidate(candidateData);
        toast.success('Candidate added successfully');
      }
      
      setModalOpen(false);
      
      // Reload candidates
      if (selectedClass) {
        loadCandidates();
      } else {
        loadAllCandidates();
      }
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Failed to save candidate');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCandidate = async () => {
    if (!deleteId) return;
    
    try {
      await deleteCandidate(deleteId);
      toast.success('Candidate deleted successfully');
      
      // Reload candidates
      if (selectedClass) {
        loadCandidates();
      } else {
        loadAllCandidates();
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };
  
  const handleImageUpload = (url: string) => {
    setUploadedImageUrl(url);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Candidate Management</h2>
          <p className="text-sm text-gray-500">Add, edit, and manage election candidates</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Select
            value={selectedClass || 'all'}
            onValueChange={handleSelectClass}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddClick} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-1" />
            Add Candidate
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {candidates.length === 0 ? (
            <Card className="p-8 flex flex-col items-center justify-center border-dashed">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Candidates Found</h3>
              <p className="text-gray-500 text-center mb-4">
                {selectedClass 
                  ? 'There are no candidates added to this class yet.' 
                  : 'There are no candidates in any class yet.'}
              </p>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Candidate
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {candidates.map((candidate) => {
                // Get class info if viewing all candidates
                const classInfo = !selectedClass 
                  ? classes.find(c => c.id === candidate.classId) 
                  : null;
                
                return (
                  <Card key={candidate.id} className="overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={candidate.photoURL || '/placeholder.svg'} 
                        alt={candidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.position}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(candidate)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDeleteClick(candidate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {candidate.bio && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{candidate.bio}</p>
                      )}
                      
                      {!selectedClass && classInfo && (
                        <div className="flex items-center mt-3 text-xs text-gray-500">
                          <School className="h-3 w-3 mr-1" />
                          <span>Class: {classInfo.name}</span>
                        </div>
                      )}
                      
                      {candidate.votes !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm font-medium">Votes: {candidate.votes || 0}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
      
      {/* Add/Edit Candidate Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Update candidate information' 
                : 'Add a new candidate to the election ballot'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input
                id="candidate-name"
                placeholder="Enter candidate name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="candidate-position">Position</Label>
              <Input
                id="candidate-position"
                placeholder="e.g., Class Representative, President"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="candidate-class">Class</Label>
              <Select 
                value={classId || ''} 
                onValueChange={setClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="candidate-bio">Bio (Optional)</Label>
              <Textarea
                id="candidate-bio"
                placeholder="Brief description of the candidate"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Candidate Photo</Label>
              <ImageUpload 
                onImageUploaded={setUploadedImageUrl} 
                currentImage={uploadedImageUrl}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddOrEditCandidate}>
              {editMode ? 'Save Changes' : 'Add Candidate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this candidate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCandidate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CandidateManager;