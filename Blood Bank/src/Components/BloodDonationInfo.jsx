// BloodDonationInfo.jsx
import React, { useState } from "react";
import personImage from "../assets/person-img.png"; // Ensure you have an image in the specified path   
import doctorImg from "../assets/doctor.png";

const bloodData = {
  "A+":   { take: ["O+", "O-", "A+", "A-"], give: ["A+", "AB+"] },
  "O+":   { take: ["O+", "O-"], give: ["O+", "A+", "B+", "AB+"] },
  "B+":   { take: ["O+", "O-", "B+", "B-"], give: ["B+", "AB+"] },
  "AB+":  { take: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"], give: ["AB+"] },
  "A-":   { take: ["O-", "A-"], give: ["A+", "A-", "AB+", "AB-"] },
  "O-":   { take: ["O-"], give: ["Everyone"] },
  "B-":   { take: ["O-", "B-"], give: ["B+", "B-", "AB+", "AB-"] },
  "AB-":  { take: ["O-", "A-", "B-", "AB-"], give: ["AB+", "AB-"] },
};

const bloodTypes = Object.keys(bloodData);

export default function BloodDonationInfo() {
  const [selected, setSelected] = useState("AB+");

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-red-700 text-center mb-8 ">Learn About Donation</h1>
      <div className="text-center mb-8">
        <span className="font-medium mr-4">Select your Blood Type</span>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {bloodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={`px-8 py-4 rounded-lg border-2 font-semibold text-lg transition
                ${selected === type
                  ? "bg-red-700 text-white border-red-700"
                  : "bg-white text-red-700 border-red-700 hover:bg-red-100"}
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-8 border-2 border-gray-200 rounded-xl">
        <div className="mx-5">
            <div className="bg-orange-100 rounded-xl px-8 py-3 flex w-[483px] my-5">
                <img src={personImage} alt="person-image" className=" pr-10"></img>
                <div>
                    <div className="font-bold text-xl mb-2">You can take from</div>
                    <div className="text-lg font-semibold space-x-2">
                        {bloodData[selected].take.map((b) => (
                        <span key={b}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-blue-100 rounded-xl px-8 py-3 flex w-[483px] mb-5">
                <img src={personImage} alt="person-image" className=" pr-10"></img>
            <div>
                <div className="font-bold text-xl mb-2">You can give to</div>
                    <div className="text-lg font-semibold space-x-2">
                        {bloodData[selected].give.map((b) => (
                        <span key={b}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="mx-5">
            <img src={doctorImg}></img>
        </div>

      </div>
      <div className="text-center text-red-700 font-medium mt-4">
        One Blood Donation can save upto <span className="text-red-500 font-bold">Three Lives</span>
      </div>
    </div>
  );
}