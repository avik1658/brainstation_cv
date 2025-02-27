import Acheivement from "./Achievement";
import Training from "./Training";


export default function TraingAndAchievement() {
    return (
        <div className="p-12 bg-gray-100 rounded-2xl shadow-lg max-w-6xl mx-auto my-5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Training/>
            <Acheivement/>
        </div>
    )
}