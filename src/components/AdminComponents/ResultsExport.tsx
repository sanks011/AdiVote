
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, Candidate } from '../../lib/firebase';
import { toast } from 'sonner';

const ResultsExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportAsCSV = async () => {
    setExporting(true);
    
    try {
      // Get candidate data with votes
      const candidatesRef = collection(db, 'candidates');
      const candidatesQuery = query(candidatesRef, orderBy('votes', 'desc'));
      const candidatesSnapshot = await getDocs(candidatesQuery);
      
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];

      // Get voter data
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const voterData = usersSnapshot.docs
        .map(doc => doc.data())
        .filter(user => user.hasVoted);
      
      // Convert to CSV
      const headers = ['Candidate ID', 'Name', 'Position', 'Votes', 'Voter Emails'];
      
      const csvContent = [
        headers.join(','),
        ...candidatesData.map(candidate => {
          const votersForCandidate = voterData
            .filter(voter => voter.votedFor === candidate.id)
            .map(voter => voter.email)
            .join('; ');
          
          return [
            candidate.id,
            `"${candidate.name}"`,
            `"${candidate.position}"`,
            candidate.votes || 0,
            `"${votersForCandidate}"`
          ].join(',');
        })
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `cr-election-results-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Export Results</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          Export the current election results to a CSV file for further analysis or record-keeping.
        </p>
        
        <Button 
          className="w-full sm:w-auto" 
          onClick={exportAsCSV}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResultsExport;