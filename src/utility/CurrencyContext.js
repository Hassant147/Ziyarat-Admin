// CurrencyContext.js
import React, { createContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [exchangeRates, setExchangeRates] = useState({});
  const [userIP, setUserIP] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationAndRates = async () => {
      try {
        const locationResponse = await fetch(
          "https://api.ipgeolocation.io/ipgeo?apiKey=04a37adbe3614fe9be6af69373226aa0"
        );
        const locationData = await locationResponse.json();
        const userCurrency = locationData.currency.code;
        const ip = locationData.ip;

        setUserIP(ip);
        setSelectedCurrency(userCurrency || "PKR");

        console.log("User IP:", ip);
        console.log("Detected Currency:", userCurrency || "PKR");

        const ratesResponse = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${userCurrency || "PKR"}`
        );
        const ratesData = await ratesResponse.json();
        setExchangeRates(ratesData.rates);

        console.log("Exchange Rates:", ratesData.rates);
      } catch (error) {
        console.error("Error fetching location or exchange rates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndRates();
  }, []);

  const updateCurrency = async (currency) => {
    setSelectedCurrency(currency);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${currency}`
      );
      const data = await response.json();
      setExchangeRates(data.rates);

      console.log("Updated Currency:", currency);
      console.log("Updated Exchange Rates:", data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        exchangeRates,
        updateCurrency,
        userIP,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export { CurrencyContext, CurrencyProvider };
