import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAxios } from "@/axios";


interface GenerateExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
}

export default function GenerateExcelModal({ isOpen, onClose, selectedIds }: GenerateExcelModalProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    allData: false,
    achievement: false,
    bs_id: false,
    career_start_date: false,
    designation: false,
    education: false,
    email: false,
    joining_date: false,
    name: false,
    name_initial: false,
    project: false,
    sub_project: false,
    tags: false,
    technical_skill: false,
    technology_used: false,
    training: false,
    updated_date: false,
  });

  const axiosInstance = useAxios();


  const handleCheckboxChange = (field: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleGenerateReport = async () => {
    if (selectedIds.length === 0) {
      console.log("No employees selected!");
      return;
    }

    try {
      const params = new URLSearchParams();
      Object.keys(selectedFields).forEach((key) => {
        if (selectedFields[key]) {
          params.append(key, "true");
        }
      });

      selectedIds.forEach((id) => {
        params.append("id", id.toString());
      });

      const response = await axiosInstance.get(`/api/v1/generate-excel/?${params.toString()}`, {
        responseType: "blob",
        timeout: 10000,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error generating Excel report:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Excel Report</DialogTitle>
          <DialogDescription>Select fields to generate the report</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(selectedFields).map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Checkbox
                id={field}
                checked={selectedFields[field]}
                onCheckedChange={() => handleCheckboxChange(field)}
              />
              <label htmlFor={field} className="text-sm">
                {field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm mt-2">Selected Employees: {selectedIds.length}</p>
        {selectedIds.length===0 && <p className="text-sm text-red-600">Please select employees to generate report</p>}
        <div className="flex justify-end gap-2">
          <Button className="bg-red-600 hover:bg-red-700 transition" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 transition" onClick={handleGenerateReport}>
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
