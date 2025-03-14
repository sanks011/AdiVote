
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  LineChart, 
  Settings, 
  Download,
  School,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Import admin components
import Dashboard from '../components/AdminComponents/Dashboard';
import CandidateManager from '../components/AdminComponents/CandidateManager';
import VotingMonitor from '../components/AdminComponents/VotingMonitor';
import ElectionControl from '../components/AdminComponents/ElectionControl';
import ResultsExport from '../components/AdminComponents/ResultsExport';
import ClassManager from '../components/AdminComponents/ClassManager';

const Admin = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname.split('/').pop() || 'dashboard';
    setActiveTab(path);
    
    // Check if mobile view
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value}`);
  };

  const tabs = [
    { value: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { value: 'classes', label: 'Classes', icon: <School className="h-4 w-4" /> },
    { value: 'candidates', label: 'Candidates', icon: <Users className="h-4 w-4" /> },
    { value: 'monitor', label: 'Monitor', icon: <LineChart className="h-4 w-4" /> },
    { value: 'control', label: 'Control', icon: <Settings className="h-4 w-4" /> },
    { value: 'export', label: 'Export', icon: <Download className="h-4 w-4" /> }
  ];

  const TabsNavigation = () => (
    <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} gap-2`}>
      {tabs.map((tab) => (
        <TabsTrigger 
          key={tab.value} 
          value={tab.value} 
          className="flex items-center gap-2 py-2 px-3 text-xs md:text-sm"
        >
          {tab.icon}
          <span className={isMobile ? 'hidden md:inline' : ''}>{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-3xl font-bold">Admin Dashboard</h1>
        
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] max-w-sm">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Admin Navigation</h2>
                <div className="flex flex-col space-y-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => handleTabChange(tab.value)}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {!isMobile && <TabsNavigation />}
        
        <Card className="shadow-sm">
          <CardContent className="pt-4 sm:pt-6 overflow-x-auto">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="classes" element={<ClassManager />} />
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