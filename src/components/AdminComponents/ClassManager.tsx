
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createClass,
  updateClass,
  deleteClass,
  getAllClasses,
  getClassUsers,
  addUserToClass,
  removeUserFromClass,
  getUserData,
  getClassRequests,
  approveClassRequest,
  rejectClassRequest
} from '../../lib/firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { School, Users, Plus, Search, Edit, Trash2, UserPlus, UserX, Loader2, UserCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

const ClassManager = () => {
  const { currentUser } = useAuth();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classUsers, setClassUsers] = useState<any[]>([]);
  const [classRequests, setClassRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [classLoading, setClassLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  
  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editClassDescription, setEditClassDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('members');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  // Load classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      const allClasses = await getAllClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };
  
  // Load class users
  const loadClassUsers = async (classId: string) => {
    try {
      setUserLoading(true);
      const users = await getClassUsers(classId);
      setClassUsers(users);
    } catch (error) {
      console.error('Error loading class users:', error);
      toast.error('Failed to load class users');
    } finally {
      setUserLoading(false);
    }
  };
  
  // Load class join requests
  const loadClassRequests = async (classId: string) => {
    try {
      setRequestsLoading(true);
      const requests = await getClassRequests(classId);
      setClassRequests(requests);
    } catch (error) {
      console.error('Error loading class requests:', error);
      toast.error('Failed to load class requests');
    } finally {
      setRequestsLoading(false);
    }
  };
  
  // Handle class selection
  const handleSelectClass = async (classItem: any) => {
    setSelectedClass(classItem);
    setActiveTab('members');
    await loadClassUsers(classItem.id);
    await loadClassRequests(classItem.id);
  };
  
  // Handle create class
  const handleCreateClass = async () => {
    if (!newClassName) {
      toast.error('Class name is required');
      return;
    }
    
    try {
      setClassLoading(true);
      if (!currentUser) return;
      
      await createClass(newClassName, newClassDescription, currentUser.uid);
      setCreateDialogOpen(false);
      setNewClassName('');
      setNewClassDescription('');
      await loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    } finally {
      setClassLoading(false);
    }
  };
  
  // Handle edit class
  const handleEditClass = async () => {
    if (!editClassName || !selectedClass) {
      toast.error('Class name is required');
      return;
    }
    
    try {
      setClassLoading(true);
      
      await updateClass(selectedClass.id, {
        name: editClassName,
        description: editClassDescription
      });
      
      setEditDialogOpen(false);
      
      // Update the local data
      const updatedClass = { ...selectedClass, name: editClassName, description: editClassDescription };
      setSelectedClass(updatedClass);
      setClasses(classes.map(c => c.id === selectedClass.id ? updatedClass : c));
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    } finally {
      setClassLoading(false);
    }
  };
  
  // Handle delete class
  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    try {
      setClassLoading(true);
      
      await deleteClass(selectedClass.id);
      
      setSelectedClass(null);
      setClassUsers([]);
      setClassRequests([]);
      await loadClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    } finally {
      setClassLoading(false);
    }
  };
  
  // Handle search user by email
  const handleSearchUser = async () => {
    if (!searchEmail) {
      setSearchResults([]);
      return;
    }
    
    try {
      setUserLoading(true);
      
      // This is a simplified implementation - in a real application,
      // you would need a function to search users by email in Firestore
      // For now, we'll just clear the results
      setSearchResults([]);
      toast.error('User search not implemented');
      
      // Ideally, you'd implement something like:
      // const results = await searchUsersByEmail(searchEmail);
      // setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setUserLoading(false);
    }
  };
  
  // Handle add user to class
  const handleAddUserToClass = async (userId: string) => {
    if (!selectedClass || !userId) return;
    
    try {
      setUserLoading(true);
      
      await addUserToClass(userId, selectedClass.id);
      
      setAddUserDialogOpen(false);
      setSearchEmail('');
      setSearchResults([]);
      
      await loadClassUsers(selectedClass.id);
    } catch (error) {
      console.error('Error adding user to class:', error);
      toast.error('Failed to add user to class');
    } finally {
      setUserLoading(false);
    }
  };
  
  // Handle remove user from class
  const handleRemoveUserFromClass = async (userId: string) => {
    if (!selectedClass || !userId) return;
    
    try {
      setUserLoading(true);
      
      await removeUserFromClass(userId);
      
      await loadClassUsers(selectedClass.id);
    } catch (error) {
      console.error('Error removing user from class:', error);
      toast.error('Failed to remove user from class');
    } finally {
      setUserLoading(false);
    }
  };
  
  // Handle approve class request
  const handleApproveRequest = async (requestId: string) => {
    if (!selectedClass) return;
    
    try {
      setRequestsLoading(true);
      
      await approveClassRequest(requestId);
      
      // Reload data
      await loadClassRequests(selectedClass.id);
      await loadClassUsers(selectedClass.id);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setRequestsLoading(false);
    }
  };
  
  // Handle reject class request
  const handleRejectRequest = async (requestId: string) => {
    if (!selectedClass) return;
    
    try {
      setRequestsLoading(true);
      
      await rejectClassRequest(requestId);
      
      // Reload data
      await loadClassRequests(selectedClass.id);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setRequestsLoading(false);
    }
  };
  
  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);
  
  // Prepare edit dialog when a class is selected
  useEffect(() => {
    if (selectedClass) {
      setEditClassName(selectedClass.name);
      setEditClassDescription(selectedClass.description || '');
    }
  }, [selectedClass]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Class Management</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Available Classes</CardTitle>
              <CardDescription>
                Select a class to view details and manage users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {classes.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">
                    No classes found. Create a new class to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {classes.map((classItem) => (
                      <div
                        key={classItem.id}
                        className={`p-3 border rounded-md cursor-pointer transition-all hover:bg-gray-50 ${
                          selectedClass?.id === classItem.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleSelectClass(classItem)}
                      >
                        <div className="font-medium">{classItem.name}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {classItem.description || 'No description'}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <School className="h-3 w-3 mr-1" />
                          <span>Admin: {classItem.adminName || 'Unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-8">
            {selectedClass ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedClass.name}</CardTitle>
                    <CardDescription>{selectedClass.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => setEditDialogOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the class and remove all students from it. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteClass}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-2 mb-6">
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="requests">
                        Join Requests
                        {classRequests.length > 0 && (
                          <Badge className="ml-2 bg-primary" variant="default">
                            {classRequests.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  
                    <TabsContent value="members">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Class Members</h3>
                            <Button size="sm" onClick={() => setAddUserDialogOpen(true)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Add User
                            </Button>
                          </div>
                          
                          {userLoading ? (
                            <div className="flex items-center justify-center h-40">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div>
                              {classUsers.length === 0 ? (
                                <div className="text-center p-4 text-gray-500 border rounded-md">
                                  No users in this class yet.
                                </div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {classUsers.map((user) => (
                                      <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.displayName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                          {user.hasVoted ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                              Voted
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                                              Not Voted
                                            </Badge>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveUserFromClass(user.id)}
                                          >
                                            <UserX className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="requests">
                      {requestsLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div>
                          {classRequests.length === 0 ? (
                            <div className="text-center p-4 text-gray-500 border rounded-md">
                              No pending requests for this class.
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Request Date</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {classRequests.map((request) => (
                                  <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.userName}</TableCell>
                                    <TableCell>{request.userEmail}</TableCell>
                                    <TableCell>
                                      {request.requestDate?.toDate().toLocaleDateString() || 'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleApproveRequest(request.id)}
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                          <UserCheck className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRejectRequest(request.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <UserMinus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Class Selected</h3>
                  <p className="text-gray-500">
                    Select a class from the left panel or create a new one to get started.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Add a new class for students to join and participate in elections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., Computer Science 2023"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classDescription">Description (Optional)</Label>
              <Textarea
                id="classDescription"
                placeholder="Brief description about this class"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClass} disabled={classLoading}>
              {classLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Class'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update class details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editClassName">Class Name</Label>
              <Input
                id="editClassName"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClassDescription">Description (Optional)</Label>
              <Textarea
                id="editClassDescription"
                value={editClassDescription}
                onChange={(e) => setEditClassDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditClass} disabled={classLoading}>
              {classLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Class</DialogTitle>
            <DialogDescription>
              Search for users by email to add them to this class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearchUser} disabled={userLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found. Try searching with a different email.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.displayName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleAddUserToClass(user.id)}
                            disabled={userLoading}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassManager;