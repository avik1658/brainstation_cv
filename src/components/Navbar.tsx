import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    return (
        <nav className="bg-black text-white px-6 py-4 shadow-md flex justify-between items-center">
            <img src="/brain.png" alt="brainstation" className="w-12 h-12 rounded-full" />

            <div className="flex gap-4">
                <Button variant="outline" className="bg-black text-white hover:bg-gray-700">
                    Download
                </Button>
                <Button variant="outline" className="bg-black text-white hover:bg-gray-700">
                    Update
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                    <Button variant="outline" className="bg-black text-white hover:bg-gray-700">
                        Profile
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white shadow-lg rounded-lg mt-2 w-48 text-gray-800">
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">My Profile</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">Profile Update</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 px-4 py-2">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
