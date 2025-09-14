import { Upload } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import AddSourceModal from './add-source-modal';

interface EmptyStateProps {
  isEmpty: boolean;
  selectedCollection?: string | null;
}

export default function EmptyState({ isEmpty, selectedCollection }: EmptyStateProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);

  const closeModals = () => {
    setIsAddModalOpen(false);
  };

  // Case 1: No collections → encourage adding one
  if (isEmpty) {
    return (
      <>
        <div className="flex flex-col items-center text-center gap-4">
          {/* Upload icon as button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Upload className="w-12 h-12 text-muted-foreground" />
          </button>

          <p className="text-lg font-medium">Add a source to get started</p>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload a source
          </Button>
        </div>

        <AddSourceModal isOpen={isAddModalOpen} onClose={closeModals} />
      </>
    );
  }

  // Case 2: Collections exist, but no source selected
  if (!isEmpty && !selectedCollection) {
    return (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-lg font-medium">Please select a source file</p>
      </div>
    );
  }

  // Case 3: Nothing to show (collection already selected)
  return null;
}
