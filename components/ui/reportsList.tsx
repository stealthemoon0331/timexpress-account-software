import { useEffect, useState } from "react";
import ReportCard, { NewReportCardProps, ReportCardProps } from "./reportCard";
import { toast } from "react-toastify";

// Replace with your API endpoint

export default function ReportsList({
  _newReport,
}: {
  _newReport: NewReportCardProps | null;
}) {
  const [reports, setReports] = useState<ReportCardProps[]>([]);
  const [newReport, setNewReport] = useState<NewReportCardProps | null>(
    _newReport
  );

  // Fetch reports from the API on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/reports");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Handle adding a new report to the database and state
  useEffect(() => {
    const addNewReport = async () => {
      if (_newReport) {
        try {
          console.log("new report => ", newReport);
          const response = await fetch("/api/admin/reports", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: _newReport.title,
              message: _newReport.message,
              userId: "1",
            }),
          });

          if (response.ok) {
            const addedReport = await response.json();
            setReports((prevReports) =>
              [...prevReports, addedReport].reverse()
            );
          } else {
            console.error("Failed to add new report:", response.statusText);
          }
        } catch (error) {
          console.error("Error adding new report:", error);
        }
      }
    };

    addNewReport();
  }, [_newReport]);

  // Handle delete report from the database and state
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reports`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
        }),
      });

      if (response.ok) {
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== id)
        );
        toast.info("Report deleted!");
      } else {
        console.error("Failed to delete report:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  // Handle edit report in the database and state
  const handleEdit = async (newData: {
    id: string;
    title: string;
    message: string;
  }) => {
    try {
      const response = await fetch(`/api/admin/reports`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const updatedReport = await response.json();
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === newData.id ? { ...report, ...newData } : report
          )
        );
        toast.info("Report updated!")
      } else {
        console.error("Failed to update report:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  // If no reports exist, show a message
  if (reports.length === 0) {
    return <p className="text-center text-muted-foreground">No reports yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}
