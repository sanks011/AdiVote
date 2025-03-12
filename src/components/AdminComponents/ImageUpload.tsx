
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

const ImageUpload = ({ onImageUploaded, currentImage }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'election_candidates');
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkrlsysdg');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkrlsysdg'}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      setPreview(data.secure_url);
      onImageUploaded(data.secure_url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Upload to Cloudinary
      uploadToCloudinary(file);
      
      // Clean up the object URL
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
          <img 
            src={preview} 
            alt="Candidate preview" 
            className="w-full h-full object-cover"
            onError={() => setPreview('/placeholder.svg')}
          />
        </div>
      ) : (
        <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('imageUpload')?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </>
          )}
        </Button>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default ImageUpload;