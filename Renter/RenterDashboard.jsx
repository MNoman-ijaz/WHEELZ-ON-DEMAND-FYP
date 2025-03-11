import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RenterNavbar from "./RenterNavbar";

const RenterDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [editForm, setEditForm] = useState({
    carImage: null,
    name: "",
    location: "",
    rentPrice: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false); 
  const [isViewing, setIsViewing] = useState(false); 
  
  const popupRef = useRef(null);
  const userEmail = localStorage.getItem("userEmail"); // Get email from localStorage

  useEffect(() => {
    const fetchVehiclesByEmail = async () => {
      setLoading(true);
      setNoResults(false);

      try {
        const response = await axios.get(
          `http://localhost:5000/api/vehicles/by-email?email=${userEmail}`
        );
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesByEmail();
  }, [userEmail]);

  const handleDelete = async (vehicleId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/vehicles/delete/${vehicleId}`);
        setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleId));
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      carImage: null, // For image upload
      name: vehicle.name,
      location: vehicle.location,
      rentPrice: vehicle.rentPrice,
      description: vehicle.description,
    });
    setIsEditing(true); // Set editing mode to true
    setIsViewing(false); // Ensure viewing mode is false
  };
  
  const handleViewMoreClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewing(true); // Set viewing mode to true
    setIsEditing(false); // Ensure editing mode is false
  };
  
  const closePopups = () => {
    setSelectedVehicle(null); // Reset the selected vehicle when closing both popups
    setIsEditing(false);
    setIsViewing(false);
  };
  

 
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditFileChange = (e) => {
    setEditForm({ ...editForm, carImage: e.target.files[0] });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.put(
        `http://localhost:5000/api/vehicles/update/${selectedVehicle._id}`,
        formData
      );
      setSelectedVehicle(null);
      setIsEditing(false);

      // Refresh the vehicle list
      const response = await axios.get(
        `http://localhost:5000/api/vehicles/by-email?email=${userEmail}`
      );
      setVehicles(response.data);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  };

  return (
    <div>
      <RenterNavbar />
      <h1 className="text-center mt-10 text-3xl font-bold underline">
        My Listings
      </h1>

      {loading ? (
        <div className="flex justify-center mt-20">
          <p>Loading vehicles...</p>
        </div>
      ) : noResults ? (
        <div className="flex justify-center mt-20">
          <h1 className="text-3xl font-bold text-red-600">No vehicles found</h1>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 my-10">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-96"
          >
            <div className="relative h-60 overflow-hidden rounded-xl">
              <img
                src={vehicle.carImage}
                alt={vehicle.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="mb-2 flex justify-between">
                <p className="text-slate-800 text-xl font-semibold">{vehicle.name}</p>
                <p className="text-cyan-600 text-xl font-semibold">Rs {vehicle.rentPrice}</p>
              </div>
              <p className="text-gray-400">{vehicle.location}</p>
              <div className="text-slate-600 leading-normal py-1 font-light line-clamp-3">
                <p className="truncate">{vehicle.description}</p>
              </div>
              <button
                className="text-cyan-600 text-sm hover:underline"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                Read More →
              </button>
              <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEditClick(vehicle)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                  >
                    Edit Listing
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    )}

      
   
      {isEditing && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 text-2xl hover:text-black z-10"
              onClick={closePopups}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Edit Listing</h2>

            <form className="space-y-4" onSubmit={handleEditSave}>
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Car Image</label>
                <input
                  type="file"
                  name="carImage"
                  onChange={handleEditFileChange}
                  className="block w-full border rounded p-2"
                />
              </div>

              {/* Car name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Car Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  className="block w-full border rounded p-2"
                  placeholder="Car name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditInputChange}
                  className="block w-full border rounded p-2"
                  placeholder="Location"
                />
              </div>

              {/* Rent price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Rent Price</label>
                <input
                  type="text"
                  name="rentPrice"
                  value={editForm.rentPrice}
                  onChange={handleEditInputChange}
                  className="block w-full border rounded p-2"
                  placeholder="Rent price"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditInputChange}
                  className="block w-full border rounded p-2"
                  placeholder="Description"
                />
              </div>

              {/* Save button */}
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded w-full hover:bg-gray-700"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedVehicle && !isEditing && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="overflow-y-auto bg-white rounded-lg pt-6 pr-7 pl-6 w-3/4 md:w-2/5 shadow-lg relative max-h-screen">
        <button
          className="absolute top-2 right-2 text-gray-500 text-2xl hover:text-black z-10"
          onClick={() => setSelectedVehicle(null)}
        >
          ✕
        </button>
        <img
          src={selectedVehicle.carImage}
          alt={selectedVehicle.name}
          className="w-full h-60 object-cover rounded-lg mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800">{selectedVehicle.name}</h2>
        <div className="mt-4 max-h-60 ">
          <p className="text-gray-600 overflow-y-auto">{selectedVehicle.description}</p>
        </div>
      </div>
    </div>
    
      )}
    </div>
  );
};

export default RenterDashboard;
