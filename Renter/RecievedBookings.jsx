import React, { useEffect, useState } from "react";
import axios from "axios";
import RenterNavbar from "./RenterNavbar";

const RecievedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const renterEmail = localStorage.getItem("userEmail"); // Retrieve renter email from localStorage
  
      if (!renterEmail) {
        alert("User is not authenticated. Please log in.");
        return;
      }
  
      try {
        const response = await axios.get("http://localhost:5000/api/recievedBookings", {
          params: { renterEmail }, // Send renter email as a query parameter
        });
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        alert("Failed to fetch bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookings();
  }, []);
  


  // Function to open image in a new tab
  const openImage = (imageUrl) => {
    const fullImageUrl = `http://localhost:5000/${imageUrl}`;
    window.open(fullImageUrl, "_blank");
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }
 
  return (
    <div>
      <RenterNavbar />
      <div className="">
        <h1 className="text-2xl font-bold mb-6 text-center"> Recieved Bookings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
              <img
                src={booking.carImage}
                alt={booking.vehicleName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{booking.vehicleName}</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">From:</span> {new Date(booking.fromDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">To:</span> {new Date(booking.toDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`${
                    booking.status === "Confirmed"
                      ? "text-green-600"
                      : booking.status === "Cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  } font-semibold`}
                >
                  {booking.status}
                </span>
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Total Cost:</span> Rs {booking.totalCost}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => openImage(booking.licenseImage)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Show License
                </button>
                <button
                  onClick={() => openImage(booking.idCardImage)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Show ID Card
                </button>
              </div>
            
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecievedBookings;