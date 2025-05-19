import { useState } from "react";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";

// Define a list of country codes and their corresponding country names
const countryNames: any = {
  "AE": "United Arab Emirates",
  "US": "United States",
  "IN": "India",
  "GB": "United Kingdom",
  "FR": "France",
  "DE": "Germany",
  "SA": "Saudi Arabia",
  "PK": "Pakistan",
  "PH": "Philippines",
  "EG": "Egypt",
  "NG": "Nigeria",
  "ZA": "South Africa",
  "KE": "Kenya",
  // Add more country codes as needed
};

export default function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    userEmail: "",
    country: "",
    phone: "",
    company: "",
    companySize: "",
    interest: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value: string, info: any) => {
    console.log("country calling code", info.countryCallingCode);
    console.log("country code", info.countryCode);
    
    // Get the country name based on the country code
    const countryName = countryNames[info.countryCode] || "Unknown";
    console.log(countryName)
    setFormData({
      ...formData,
      phone: value,
      country: countryName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.info("Request sent successfully!");
        onClose();
      } else {
        toast.warn("Email was not submitted!");
      }
    } catch (err) {
      console.error("Error submitting demo form", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-md p-6 max-w-3xl w-full shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl">×</button>
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Full Name *"
            name="fullName"
            required
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Email *"
            name="userEmail"
            required
            type="email"
            onChange={handleChange}
            variant="outlined"
          />

          {/* Phone input with country code and auto-detect */}
          <MuiTelInput
            value={formData.phone}
            onChange={handlePhoneChange}
            defaultCountry="AE"
            onlyCountries={["AE", "US", "IN", "GB", "FR", "DE", "SA", "PK", "PH", "EG", "NG", "ZA", "KE"]} // optional
            fullWidth
            label="Phone Number"
          />

          <TextField
            label="Company"
            name="company"
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Company Size"
            name="companySize"
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Primary Interest"
            name="interest"
            onChange={handleChange}
            variant="outlined"
            fullWidth
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded col-span-1 md:col-span-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
