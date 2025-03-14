import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ImageUploadProps {
  folderPath: string;
  onImageUploaded: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ folderPath, onImageUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folderPath);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUploaded(data.secure_url);
      setUploadComplete(true);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadComplete(false);
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
    </div>
  );
};

export default ImageUpload;