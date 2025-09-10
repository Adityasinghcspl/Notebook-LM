import { useState } from "react";
import {  Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Link, FileText, Loader2 } from "lucide-react";
import type { Source } from "@/types/type";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify"

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceAdded?: (source: Source) => void;
}

export default function AddSourceModal({
  isOpen,
  onClose,
  onSourceAdded,
}: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "text">("upload");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title.trim()) {
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
      let response;

      if (activeTab === "url" && url.trim()) {
        response = await fetch("http://localhost:5000/api/url/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), url }),
        });
      } else if (activeTab === "text" && text.trim()) {
        response = await fetch("http://localhost:5000/api/content/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: text }),
        });
      } else if (activeTab === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title.trim());

        response = await fetch("http://localhost:5000/api/file/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        toast.error("Please provide all required information");
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      const data = await response.json();

      const source: Source = {
        id: data.id || Date.now().toString(),
        title: title.trim(),
        type: activeTab === "upload" ? "PDF" : activeTab === "url" ? "URL" : "Text",
        content: activeTab === "url" ? url : activeTab === "text" ? text : file?.name || "",
        createdAt: new Date().toISOString(),
      };

      toast.success("Source uploaded successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload source");
    } finally {
      setUrl("");
      setText("");
      setTitle("");
      setFile(null);
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
