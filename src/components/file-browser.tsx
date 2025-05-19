"use client";

import { useState } from "react";
import {
  File,
  Folder,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Share2,
  Pencil,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock data for demonstration
const initialItems = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    size: "-",
    modified: "May 10, 2023",
  },
  {
    id: "2",
    name: "Images",
    type: "folder",
    size: "-",
    modified: "Apr 25, 2023",
  },
  {
    id: "3",
    name: "Project Proposal.docx",
    type: "file",
    size: "2.3 MB",
    modified: "May 12, 2023",
  },
  {
    id: "4",
    name: "Budget.xlsx",
    type: "file",
    size: "1.5 MB",
    modified: "May 5, 2023",
  },
  {
    id: "5",
    name: "Presentation.pptx",
    type: "file",
    size: "5.7 MB",
    modified: "Apr 28, 2023",
  },
  {
    id: "6",
    name: "Report.pdf",
    type: "file",
    size: "3.2 MB",
    modified: "May 14, 2023",
  },
];

export function FileBrowser() {
  const [items, setItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  //const { toast } = useToast();

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const deleteItems = (ids: string[]) => {
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedItems((prev) => prev.filter((id) => !ids.includes(id)));
    toast("Items deleted", {
      description: `${ids.length} item(s) moved to trash`,
    });
  };

  const handleAction = (action: string, id: string) => {
    const item = items.find((item) => item.id === id);

    switch (action) {
      case "star":
        toast("Item starred", {
          description: `"${item?.name}" added to starred`,
        });
        break;
      case "rename":
        toast("Rename", {
          description: `Rename functionality (demo only)`,
        });
        break;
      case "share":
        toast("Share", {
          description: `Share functionality (demo only)`,
        });
        break;
      case "download":
        toast("Download", {
          description: `Download functionality (demo only)`,
        });
        break;
      case "info":
        toast("File Info", {
          description: `Info functionality (demo only)`,
        });
        break;
      case "delete":
        deleteItems([id]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={
              selectedItems.length > 0 && selectedItems.length === items.length
            }
            onCheckedChange={selectAllItems}
          />
          <span className="text-sm font-medium">Name</span>
        </div>
        <div className="flex items-center gap-16">
          <span className="text-sm font-medium">Size</span>
          <span className="text-sm font-medium">Last modified</span>
          <span className="w-10"></span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Folder className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No items</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload files or create folders to get started
          </p>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 hover:bg-muted/50 ${
                selectedItems.includes(item.id) ? "bg-muted/50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                />
                <div className="flex items-center gap-2">
                  {item.type === "folder" ? (
                    <Folder className="w-5 h-5 text-blue-500" />
                  ) : (
                    <File className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-16">
                <span className="text-sm text-muted-foreground w-16">
                  {item.size}
                </span>
                <span className="text-sm text-muted-foreground w-32">
                  {item.modified}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAction("star", item.id)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      <span>Star</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("rename", item.id)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("share", item.id)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction("download", item.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span>Download</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction("info", item.id)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      <span>Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction("delete", item.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background border rounded-lg shadow-lg p-2 flex items-center gap-2">
          <span className="text-sm font-medium px-2">
            {selectedItems.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("share", selectedItems[0])}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("download", selectedItems[0])}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-500 hover:bg-red-50"
            onClick={() => deleteItems(selectedItems)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
