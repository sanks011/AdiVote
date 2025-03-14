
import { useState } from 'react';

/**
 * A reusable hook to manage the selected class ID state
 * @returns {[string | null, (classId: string | null) => void]} A tuple with the selected class ID and a setter function
 */
export const useSelectedClass = () => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  return [selectedClassId, setSelectedClassId] as const;
};