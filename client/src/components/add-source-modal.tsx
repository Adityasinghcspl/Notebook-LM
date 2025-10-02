"use client"

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Link, FileText, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [fileType, setFileType] = useState<"pdf" | "vtt">("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Conditional schema based on activeTab
  const FormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    fileType: z.enum(["pdf", "vtt"]),
    file: z
      .any() // allow any type first
      .superRefine((val, ctx) => {
        if (activeTab === "upload") {
          if (!val) {
            ctx.addIssue({ path: ["file"], code: z.ZodIssueCode.custom, message: "File is required" });
          } else {
            if (fileType === "pdf") {
              if (!(val instanceof File)) {
                ctx.addIssue({ path: ["file"], code: z.ZodIssueCode.custom, message: "Must be a PDF file" });
              } else if (val.type !== "application/pdf") {
                ctx.addIssue({ path: ["file"], code: z.ZodIssueCode.custom, message: "File must be PDF" });
              }
            } else {
              // VTT case
              if (!Array.isArray(val) || !val.every((f: any) => f instanceof File && f.name.endsWith(".vtt"))) {
                ctx.addIssue({ path: ["file"], code: z.ZodIssueCode.custom, message: "All files must be VTT" });
              }
            }
          }
        }
      }),
    url: z.string().optional(),
    text: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: propTitle || "",
      fileType: "pdf",
      file: undefined,
      url: "",
      text: "",
    },
  });
  const watchAll = useWatch({ control: form.control });

  const isSubmitDisabled = () => {
    const titleFilled = watchAll?.title?.trim();
    if (!titleFilled) return true;
    if (activeTab === "upload") {
      if (!watchAll.file) return true;
      if (fileType === "pdf" && !(watchAll.file instanceof File)) return true; // only 1 PDF
      if (fileType === "vtt" && (!Array.isArray(watchAll.file) || watchAll.file.length === 0)) return true; // at least 1 VTT
    }
    if (activeTab === "url") {
      return !watchAll.url?.trim();
    }
    if (activeTab === "text") {
      return !watchAll.text?.trim();
    }
    return false;
  };

  useEffect(() => {
    if (propTitle) form.setValue("title", propTitle);
  }, [propTitle]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const responce = await dispatch(
        uploadSource({
        activeTab,
        title: data.title,
        fileType: data.fileType,
        url: data.url,
        text: data.text,
        file: data.file,
      })
      ).unwrap();
      toast.success(responce?.message || "Source uploaded successfully!");
      dispatch(getAllCollectionList());
      onClose();
    } catch (error: any) {
      toast.error(error);
    } finally {
      form.reset()
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
          {["upload", "url", "text"].map((tab) => (
            <Button
              key={tab}
              type="button"
              variant={activeTab === tab ? "secondary" : "outline"}
              onClick={() => setActiveTab(tab as any)}
              className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors h-full"
            >
              <div className="flex flex-col items-center">
                {tab === "upload" && <Upload className="w-4 h-4 mb-1" />}
                {tab === "url" && <Link className="w-4 h-4 mb-1" />}
                {tab === "text" && <FileText className="w-4 h-4 mb-1" />}
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </div>
            </Button>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter title" disabled={!!propTitle} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <>
                <FormField
                  control={form.control}
                  name="fileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select File Type *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setFileType(val as "pdf" | "vtt");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select file type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="vtt">VTT</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fileType === "pdf" ? "Upload PDF" : "Upload VTT"} *</FormLabel>
                      <FormControl>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          selection:bg-primary selection:text-primary-foreground dark:bg-input/30 shadow-xs`}
                        >
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">
                            {Array.isArray(field.value) && field.value.length > 0
                              ? field.value.map((f: File) => f.name).join(", ")
                              : field.value instanceof File
                                ? field.value.name
                                : `Drag and drop ${fileType.toUpperCase()} files here`}
                          </p>
                          <p className="text-sm text-gray-500">or click to browse</p>
                          <Input
                            type="file"
                            accept={fileType === "pdf" ? ".pdf" : ".vtt"}
                            multiple={fileType === "vtt"} // Allow multiple VTT files
                            onChange={(e) => {
                              const files = e.target.files;
                              if (!files) return;
                              if (fileType === "pdf") {
                                field.onChange(files[0]); // Single PDF
                              } else {
                                field.onChange(Array.from(files)); // Multiple VTT files
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required={activeTab === "upload"}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* URL Tab */}
            {activeTab === "url" && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Text Tab */}
            {activeTab === "text" && (
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Content *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter text content" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-2 mt-4">
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitDisabled()}
                className="flex-1"
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

              {/* Reset Button */}
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}