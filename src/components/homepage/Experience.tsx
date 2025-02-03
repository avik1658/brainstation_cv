import { experience } from "./dummyData";

export default function Experience() {
    return (
        <div className="bg-gray-100 rounded-2xl w-full max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Experience</h1>
            <div className="grid grid-cols-1 gap-6">
                {experience.map((exp, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col min-h-[120px]" >
                        <h2 className="text-xl font-semibold text-gray-700">{exp.designation}</h2>
                        <h3 className="text-xl text-gray-500">{exp.company}</h3>
                        <h4 className="text-sm text-gray-400 mt-auto">{exp.from} - {exp.to}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}