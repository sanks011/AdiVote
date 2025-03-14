import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClassSelectorProps {
  selectedClassId: string | null;
  setSelectedClassId: (classId: string | null) => void;
  label?: string;
}

const ClassSelector = ({ selectedClassId, setSelectedClassId, label = "Select Class" }: ClassSelectorProps) => {
  const { classes } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!classes) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  // Filter classes based on search query (email or name)
  const filteredClasses = classes.filter(cls => 
    cls.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
      <Select
        value={selectedClassId || undefined}
        onValueChange={setSelectedClassId}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a class to manage" />
        </SelectTrigger>
        <SelectContent className="w-[300px]">
          <div className="flex items-center px-3 pb-2 border-b">
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredClasses.length === 0 ? (
              <div className="py-2 px-3 text-sm text-gray-500">
                No classes found
              </div>
            ) : (
              filteredClasses.map((cls) => (
                <SelectItem 
                  key={cls.id} 
                  value={cls.id}
                  className="flex flex-col items-start"
                >
                  <span className="font-medium">{cls.name}</span>
                  <span className="text-xs text-gray-500">{cls.email}</span>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClassSelector;