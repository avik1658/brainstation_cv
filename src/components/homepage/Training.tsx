import { training } from "./dummyData";

export default function Training() {
    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Training</h1>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
                {training.map((element, index) => (
                    <li key={index} className="font-semibold">
                        {element}
                    </li>
                ))}
            </ul>
        </div>
    );
}
