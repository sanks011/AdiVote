
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  LineChart, 
  Settings, 
  Download 
} from 'lucide-react';

// Import admin components
import Dashboard from '../components/AdminComponents/Dashboard';
import CandidateManager from '../components/AdminComponents/CandidateManager';
import VotingMonitor from '../components/AdminComponents/VotingMonitor';
import ElectionControl from '../components/AdminComponents/ElectionControl';
import ResultsExport from '../components/AdminComponents/ResultsExport';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Candidates
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Control
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="candidates" element={<CandidateManager />} />
              <Route path="monitor" element={<VotingMonitor />} />
              <Route path="control" element={<ElectionControl />} />
              <Route path="export" element={<ResultsExport />} />
            </Routes>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Admin;
