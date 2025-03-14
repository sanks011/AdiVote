import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

export interface ImageUploadProps {
  folderPath: string;
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ folderPath, onImageUploaded, currentImage }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }
      
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadComplete(false);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      setError(null);
      
      // Ensure folderPath is not empty
      if (!folderPath) {
        throw new Error('Folder path is required');
      }
      
      // Show uploading toast
      const uploadToast = toast.loading('Uploading image...');
      
      const url = await uploadToCloudinary(selectedFile, folderPath);
      
      if (url) {
        onImageUploaded(url);
        setUploadComplete(true);
        toast.success('Image uploaded successfully', {
          id: uploadToast
        });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadComplete(false);
    setError(null);
  };
  
  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-10 w-10 text-gray-400" />
            <span className="text-sm font-medium">Click to select an image</span>
            <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          <div className="p-3 bg-gray-50 border-t flex justify-end">
            {uploadComplete ? (
              <Button variant="outline" size="sm" className="text-green-600" disabled>
                <Check className="h-4 w-4 mr-1" />
                Uploaded
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpload} 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;