import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
 const [sorting, setSorting] = useState<SortingState>([]);
 const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
 const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
 const [selectedDesignation, setSelectedDesignation] = useState<string | undefined>(undefined);
 const [uniqueDesignations, setUniqueDesignations] = useState<string[]>([]);
 const [selectedUpdateStatus, setSelectedUpdateStatus] = useState<string | undefined>(undefined);
 const [uniqueUpdateStatuses, setUniqueUpdateStatuses] = useState<string[]>([]);

 const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  useEffect(() => {
    const uniqueDesignations = Array.from(
      table.getColumn("designation")?.getFacetedUniqueValues()?.keys() || []
    );
    const uniqueUpdateStatuses = Array.from(
      table.getColumn("updateStatus")?.getFacetedUniqueValues()?.keys() || []
    );
  
    setUniqueDesignations(uniqueDesignations);
    setUniqueUpdateStatuses(uniqueUpdateStatuses);
  }, [table]); 
  
  useEffect(() => {
    table.getColumn("designation")?.setFilterValue(selectedDesignation);
    table.getColumn("updateStatus")?.setFilterValue(selectedUpdateStatus);
  }, [selectedDesignation, selectedUpdateStatus, table]);
  

  return (
    <div className="rounded-md border">
        <div className="flex justify-between items-center py-4 px-4">
            <Input
                placeholder="Filter by name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm border-2 border-black"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4">
                  {selectedDesignation || "Filter by designation"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {uniqueDesignations.map((designation) => (
                  <DropdownMenuItem
                    key={designation}
                    onClick={() => setSelectedDesignation(designation)}
                  >
                    {designation}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setSelectedDesignation(undefined)}>
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4">
                  {selectedUpdateStatus || "Filter by update status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {uniqueUpdateStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSelectedUpdateStatus(status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={() => setSelectedUpdateStatus(undefined)}>
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                        Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                        .getAllColumns()
                        .filter(
                            (column) => column.getCanHide()
                        )
                        .map((column) => {
                            return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                                }
                            >
                                {column.id}
                            </DropdownMenuCheckboxItem>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
        </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}