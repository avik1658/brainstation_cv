import { employees } from "../homepage/dummyData";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function Employee() {
    return (
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 gap-4">
            <h1 className="text-3xl font-bold text-center mb-4">Employee List</h1>
            <DataTable columns={columns} data={employees} />
        </div>
    );
}
