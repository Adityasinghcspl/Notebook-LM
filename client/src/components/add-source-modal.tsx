import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Link, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify"
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { uploadSource } from "@/redux/features/slice/embeddingSlice";
import { getAllCollectionList } from "@/redux/features/slice/collectionsSlice";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
}

export default function AddSourceModal({ isOpen, onClose, title: propTitle }: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "text">("upload");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Initialize title if propTitle exists
  useEffect(() => {
    if (propTitle) {
      setTitle(propTitle);
    } else {
      setTitle("");
    }
  }, [propTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!propTitle && !title.trim()) {
        setTitle(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsLoading(true);
    try {
      const responce = await dispatch(
        uploadSource({ activeTab, title, url, text, file })
      ).unwrap();
      toast.success(responce?.message || "Source uploaded successfully!");
      dispatch(getAllCollectionList());
      onClose();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setUrl("");
      if (!propTitle) setTitle("");
      setFile(null);
      setText("l")
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Add Source</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 rounded-lg p-1">
          <Button
            type="button"
            variant={activeTab === "upload" ? "secondary" : "outline"}
            onClick={() => setActiveTab("upload")}
            className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors h-full"
          >
            <div className="flex flex-col items-center">
              <Upload className="w-4 h-4 mb-1" />
              <span>Upload</span>
            </div>
          </Button>

          <Button
            type="button"
            variant={activeTab === "url" ? "secondary" : "outline"}
            onClick={() => setActiveTab("url")}
            className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors h-full"
          >
            <div className="flex flex-col items-center">
              <Link className="w-4 h-4 mb-1" />
              <span>URL</span>
            </div>
          </Button>

          <Button
            type="button"
            variant={activeTab === "text" ? "secondary" : "outline"}
            onClick={() => setActiveTab("text")}
            className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors h-full"
          >
            <div className="flex flex-col items-center">
              <FileText className="w-4 h-4 mb-1" />
              <span>Text</span>
            </div>
          </Button>
        </div>


        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Title *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this source (required)"
              disabled={!!propTitle}
              required
            />
          </div>

          {/* Upload */}
          {activeTab === "upload" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload PDF File *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                   selection:bg-primary selection:text-primary-foreground dark:bg-input/30 shadow-xs `}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  {file ? file.name : "Drag and drop PDF files here"}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
              </div>
            </div>
          )}

          {/* URL */}
          {activeTab === "url" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL *
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {/* Text */}
          {activeTab === "text" && (
            <div className="mb-4">
              <label className="block text-sm font-medium pb-2">
                Text Content *
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text content here..."
                required
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex pt-3">
            <Button
              variant='outline'
              type="submit"
              disabled={
                isLoading ||
                !title.trim() ||
                (activeTab === "upload" && !file) ||
                (activeTab === "url" && !url.trim()) ||
                (activeTab === "text" && !text.trim())
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Add Source</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
