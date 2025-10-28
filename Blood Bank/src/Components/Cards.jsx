// // cards.jsx
// import time from "../assets/time.png"; // Ensure you have an image in the specified path
// import refreshment from "../assets/refreshment.png";
// import currency from "../assets/currency.png";
// import heart from "../assets/heart.png";

// export default function Cards() {
//   return (
//     <div className=" bg-[#572f31]">
//       {/* animate-scroll */}
//       <div className="h-[375px] flex justify-around items-center   ">
//         {/* BOX1 animate-slideX */}
//         <div className="w-[300px] h-[280px] bg-white border border-[#efefef] rounded-2xl flex justify-center">
//           <div className="w-[260px] h-[241px] flex flex-col justify-center items-center">
//             <img src={time} alt="time" className="" />
//             <div className="font-bold text-2xl my-2">It takes only an hour</div>
//             <div className="text-center">Donate blood save lives!</div>
//           </div>
//         </div>
//         {/* BOX2 */}
//         <div className="w-[300px] h-[280px] bg-white border border-[#efefef] rounded-2xl flex justify-center ">
//           <div className="w-[260px] h-[241px] flex flex-col justify-center items-center">
//             <img src={refreshment} alt="refreshment" className="" />
//             <div className="font-bold text-2xl my-2 text-center">You will get free refreshments after donation</div>
//             <div className="text-center">Donation of blood is safe and healthy</div>
//           </div>
//         </div>
//         {/* BOX3 */}
//         <div className="w-[300px] h-[280px] bg-white border border-[#efefef] rounded-2xl flex justify-center ">
//           <div className="w-[260px] h-[241px] flex flex-col justify-center items-center">
//             <img src={currency} alt="currency" className="" />
//             <div className="font-bold text-2xl my-2 text-center">It costs nothing</div>
//             <div className="text-center">Give blood and stay healthy</div>
//           </div>
//         </div>
//         {/* BOX4 */}
//         <div className="w-[300px] h-[280px] bg-white border border-[#efefef] rounded-2xl flex justify-center ">
//           <div className="w-[260px] h-[241px] flex flex-col justify-center items-center">
//             <img src={heart} alt="heart" className="" />
//             <div className="font-bold text-2xl my-2 text-center">There is nothing better than saving a life</div>
//             <div className="text-center">Every blood donor is a hero</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// cards.jsx
import time from "../assets/time.png";
import refreshment from "../assets/refreshment.png";
import currency from "../assets/currency.png";
import heart from "../assets/heart.png";

export default function Cards() {
  return (
    <div className="bg-[#572f31]">
      <div className="h-[375px] w-full flex justify-center items-center gap-6 overflow-hidden animate-scroll">
        {/* Card */}
        <div className="w-[500px] h-[250px] bg-white border border-[#efefef] rounded-2xl flex justify-center">
          <div className="w-[260px] h-[241px] flex flex-col items-center my-3">
            {/* Fixed image row keeps all images aligned */}
            <div className="h-16 flex items-center justify-center">
              <img src={time} alt="time" className="h-12 w-12 object-contain" />
            </div>
            {/* Tight text spacing near the image */}
            <div className="flex-1 flex flex-col items-center justify-start text-center gap-1 px-2">
              <div className="font-bold text-2xl leading-none mt-1 my-3">It takes only an hour</div>
              <div className="leading-tight">Donate blood save lives!</div>
            </div>
          </div>
        </div>

        {/* Repeat same structure for other cards */}
        <div className="w-[500px] h-[250px] bg-white border border-[#efefef] rounded-2xl flex justify-center">
          <div className="w-[260px] h-[241px] flex flex-col items-center my-3">
            <div className="h-16 flex items-center justify-center">
              <img src={refreshment} alt="refreshment" className="h-12 w-12 object-contain" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-start text-center gap-1 px-2">
              <div className="font-bold text-2xl leading-none mt-1 my-3">You will get free refreshments after donation</div>
              <div className="leading-tight">Donation of blood is safe and healthy</div>
            </div>
          </div>
        </div>

        <div className="w-[500px] h-[250px] bg-white border border-[#efefef] rounded-2xl flex justify-center">
          <div className="w-[260px] h-[241px] flex flex-col items-center my-3">
            <div className="h-16 flex items-center justify-center">
              <img src={currency} alt="currency" className="h-12 w-12 object-contain" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-start text-center gap-1 px-2">
              <div className="font-bold text-2xl leading-none mt-1 my-3">It costs nothing</div>
              <div className="leading-tight">Give blood and stay healthy</div>
            </div>
          </div>
        </div>

        <div className="w-[500px] h-[250px] bg-white border border-[#efefef] rounded-2xl flex justify-center">
          <div className="w-[260px] h-[241px] flex flex-col items-center my-3">
            <div className="h-16 flex items-center justify-center">
              <img src={heart} alt="heart" className="h-12 w-12 object-contain" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-start text-center gap-1 px-2">
              <div className="font-bold text-2xl leading-none mt-1 my-3">There is nothing better than saving a life</div>
              <div className="leading-tight">Every blood donor is a hero</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

