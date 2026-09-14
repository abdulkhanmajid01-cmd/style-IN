"use client";
// "use client" zaroori hai — form input state (useState) aur validation
// sab client-side par hota hai.

import { useState } from "react";
import Button from "./ui/Button";

// Simple Pakistani mobile number check: 03XXXXXXXXX (11 digits, 03 se shuru)
// ya +923XXXXXXXXX. Bohot strict nahi rakha — bas obvious galtiyan pakarne
// ke liye (jaise sirf 3 digits daal dena).
const PHONE_REGEX = /^(03\d{9}|\+923\d{9})$/;

// Basic email format check — "kuch@kuch.kuch" pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// onSubmit: parent (checkout page) se aane wala function — yeh form sirf
// validate karta hai aur clean data upar bhej deta hai. Parent decide
// karega us data ka kya karna hai (Phase 1: fake success, Phase 2: real API call).
// Is separation se CheckoutForm khud kisi API/cart logic se bandha nahi —
// isliye reusable aur test karna aasan rehta hai.
export default function CheckoutForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
  });

  // errors object: har field ka apna error message (ya khali string = no error)
  const [errors, setErrors] = useState({});

  // Ek hi function sab inputs ke liye — field ka naam "name" attribute se pata chalta hai
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Sab fields ko check karta hai, errors object banata hai.
  // Return: true agar sab theek hai, false agar koi error hai.
  function validate() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Naam likhna zaroori hai.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email likhna zaroori hai.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = "Sahi email likhein, jaise aap@example.com.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number likhna zaroori hai.";
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      newErrors.phone = "Sahi number likhein, jaise 03001234567.";
    }

    // WhatsApp optional hai — agar khali chhora hai to koi error nahi,
    // lekin agar kuch likha hai to uska format bhi sahi hona chahiye
    if (formData.whatsapp.trim() && !PHONE_REGEX.test(formData.whatsapp.trim())) {
      newErrors.whatsapp = "Sahi WhatsApp number likhein, jaise 03001234567.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Home address likhna zaroori hai.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Shehar likhna zaroori hai.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // koi key nahi = koi error nahi
  }

  function handleSubmit(e) {
    e.preventDefault(); // browser ka default form-submit (page reload) rokna
    if (validate()) {
      onSubmit(formData); // sirf tab parent ko data bhejo jab sab theek ho
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Your name"
        />
        {errors.fullName && <span className="field-error">{errors.fullName}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
        <span className="field-hint">Order confirmation isi par bhejenge.</span>
      </div>

      <div className="form-field">
        <label htmlFor="phone">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="03001234567"
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="whatsapp">WhatsApp number (optional)</label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="Agar phone number se alag ho"
        />
        {errors.whatsapp && <span className="field-error">{errors.whatsapp}</span>}
        <span className="field-hint">Khali chhorein agar phone number hi WhatsApp par bhi hai.</span>
      </div>

      <div className="form-field">
        <label htmlFor="address">Home address</label>
        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="House / street / area"
        />
        {errors.address && <span className="field-error">{errors.address}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          value={formData.city}
          onChange={handleChange}
          placeholder="e.g. Lahore"
        />
        {errors.city && <span className="field-error">{errors.city}</span>}
      </div>

      <p className="cod-note">Payment method: Cash on Delivery only.</p>

      {/* disabled=isSubmitting — Phase 2 mein jab yeh real API call karega,
          to submit ke dauran button dobara click hone se rokta hai (double-order na ban jaye) */}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
      </Button>
    </form>
  );
}
