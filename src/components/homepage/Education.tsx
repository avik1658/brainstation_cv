import { education } from "./dummyData";

export default function Education() {
    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Education</h1>
            <div className="grid grid-cols-1 gap-6">
                {education.map((edu, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]">
                        <h2 className="text-xl font-semibold text-gray-700">{edu.degree} in {edu.department}</h2>
                        <h4 className="text-sm text-gray-400 mt-auto">{edu.passingYear}</h4>
                        <h4 className="text-sm text-gray-400">{edu.university_Institute}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}