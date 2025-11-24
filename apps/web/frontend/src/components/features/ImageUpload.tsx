"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Eye, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * CRM IMMOBILIARE - Image Upload Component
 *
 * Professional multi-file image upload with:
 * - Drag & drop zone
 * - Click to upload
 * - Gallery preview grid
 * - Image preview modal
 * - Delete functionality
 *
 * @module features/ImageUpload
 * @since v3.1.1
 */

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploadProps {
  value: ImageFile[];
  onChange: (files: ImageFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 20,
  maxSizeMB = 10,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles: ImageFile[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} non è un'immagine valida`);
          return;
        }

        // Validate file size
        if (file.size > maxSizeBytes) {
          alert(`${file.name} supera la dimensione massima di ${maxSizeMB}MB`);
          return;
        }

        // Check max files limit
        if (value.length + newFiles.length >= maxFiles) {
          alert(`Puoi caricare massimo ${maxFiles} immagini`);
          return;
        }

        // Create preview
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const preview = URL.createObjectURL(file);

        newFiles.push({ id, file, preview });
      });

      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
      }
    },
    [value, onChange, maxFiles, maxSizeMB]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow uploading the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  // Remove image
  const handleRemove = useCallback(
    (id: string) => {
      const imageToRemove = value.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      onChange(value.filter((img) => img.id !== id));
    },
    [value, onChange]
  );

  // Open file picker
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <Upload className={cn("h-10 w-10 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />

        <div className="text-center">
          <p className="text-sm font-medium mb-1">
            {isDragging ? "Rilascia qui le immagini" : "Trascina le immagini qui"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            oppure clicca per selezionare i file
          </p>
          <p className="text-xs text-muted-foreground">
            Massimo {maxFiles} immagini • Max {maxSizeMB}MB per file
          </p>
          <p className="text-xs text-muted-foreground">
            {value.length}/{maxFiles} immagini caricate
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Gallery Grid */}
      {value.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Immagini caricate ({value.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                {/* Image */}
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                    Principale
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(image);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(image.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs truncate">{image.file.name}</p>
                  <p className="text-white/70 text-xs">
                    {(image.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-8 rounded-lg border-2 border-dashed border-muted">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Nessuna immagine caricata
          </p>
        </div>
      )}

      {/* Preview Dialog */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewImage.file.name}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full max-h-[70vh] overflow-hidden rounded-lg">
              <img
                src={previewImage.preview}
                alt={previewImage.file.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Dimensione: {(previewImage.file.size / 1024).toFixed(2)} KB</span>
              <span>Tipo: {previewImage.file.type}</span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
