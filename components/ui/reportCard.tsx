import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface NewReportCardProps {
  title?: string;
  message?: string;
  userId: string;
  userName?: string;
}

export interface ReportCardProps {
  id: string;
  title: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export default function ReportCard({
  report,
  onDelete,
  onEdit,
}: {
  report: ReportCardProps;
  onDelete: (id: string) => void;
  onEdit: (data: {id: string, title: string; message: string }) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(report.title);
  const [editMessage, setEditMessage] = useState(report.message);

  const handleSave = () => {
    onEdit({id: report.id, title: editTitle, message: editMessage });
    setEditing(false);
  };

  return (
    <Card className="border">
      <CardHeader>
        {editing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        ) : (
          <CardTitle>{report.title} to {report.userName}</CardTitle>
        )}
        {new Date(report.createdAt).toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </CardHeader>

      <CardContent
        className={`${
          expanded ? "max-h-[300px]" : "max-h-24"
        } overflow-y-auto transition-all duration-300`}
      >
        {editing ? (
          <Textarea
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
          />
        ) : (
          report.message
        )}
      </CardContent>

      <div className="flex justify-between items-center px-4 pb-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show More"}
        </Button>
        <div className="flex space-x-2">
          {editing ? (
            <>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(report.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
