import axiosInstance from "@/axios";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FaDownload } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Employee {
  id: number;
  name: string;
  bs_id: string;
  designation: number;
}

interface Designation {
  id: number;
  name: string;
}

export default function Employee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [designation, setDesignation] = useState<Designation[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchEmployee = async (query = "", page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/api/v1/employee/search`, {
        params: { q: query, page: page, page_size: pageSize },
      });
      setEmployees(response.data.results);
      setTotalEmployees(response.data.count);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setSelectedEmployees([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchDesignation = async () => {
    try {
      const response = await axiosInstance.get<Designation[]>(`/api/v1/designations/`);
      setDesignation(response.data);
    } catch (error) {
      console.error("Error fetching designation:", error);
    }
  };

  const downloadCV = async (id: number, bs_id: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/generate-pdf/${id}/`, {
        responseType: "blob",
        timeout: 10000,
        headers: { Accept: "application/pdf" },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CV_${bs_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CV:", error);
    }
  };

  const downloadSelectedCVs = async () => {
    for (const id of selectedEmployees) {
      const employee = employees.find((emp) => emp.id === id);
      if (employee) {
        await downloadCV(employee.id, employee.bs_id);
      }
    }
};


  useEffect(() => {
    fetchDesignation();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchEmployee(searchTerm, currentPage, pageSize);
  }, [searchTerm, currentPage, pageSize]);

  const getDesignationName = (id: number): string => {
    return designation.find((d) => d.id === id)?.name || "Unknown";
  };

  const handleNextPage = () => nextPage && setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => prevPage && setCurrentPage((prev) => prev - 1);

  const toggleSelection = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((e) => e.id));
    }
    setSelectAll(!selectAll);
  };


  return (
    <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
      <h1 className="text-3xl font-bold text-center mb-4">Employee List</h1>

      <Input type="text" placeholder="Search By Name..." className="mb-4 p-2 border border-gray-300 rounded" 
      onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} />
      
      <Table>
        <TableCaption className="text-sm font-medium">Total Employees: {totalEmployees}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">
              <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
            </TableHead>
            <TableHead className="w-2/12">BS ID</TableHead>
            <TableHead className="w-4/12">Name</TableHead>
            <TableHead className="w-4/12">Designation</TableHead>
            <TableHead className="w-1/12 text-center">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="h-10">
              <TableCell>
                <Checkbox checked={selectedEmployees.includes(employee.id)} 
                onCheckedChange={() => toggleSelection(employee.id)} />
              </TableCell>
              <TableCell>{employee.bs_id}</TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{getDesignationName(employee.designation)}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                    <FaDownload className="hover:text-sky-500 transition cursor-pointer" onClick={()=>downloadCV(employee.id,employee.bs_id)} />
                </div>
               </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 gap-3">
            <Button onClick={handlePrevPage} disabled={!prevPage} className="w-24 bg-sky-600 hover:bg-sky-700 transition">
                Previous
            </Button>
            <Select
                onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1)
                }}
            >
                <SelectTrigger className="w-24">
                    <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Page Size</SelectLabel>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button onClick={handleNextPage} disabled={!nextPage} className="w-24 bg-sky-600 hover:bg-sky-700 transition">
                Next
            </Button>
       </div>


      <div className="flex justify-center mt-4 gap-3">
        <Button onClick={downloadSelectedCVs} disabled={!selectedEmployees.length} className="bg-sky-600 hover:bg-sky-700 transition">
            Download Selected CVs
        </Button>
      </div>
    </div>
  );
}
