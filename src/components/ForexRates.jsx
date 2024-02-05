import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ForexRates = () => {
  const [rates, setRates] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currenciesPerPage] = useState(20);
  const [sortOption, setSortOption] = useState("name");
  const apiKey = import.meta.env.VITE_API_KEY; // API KEY

  // Load dark mode setting from localStorage or default to false
  const storedDarkMode = localStorage.getItem("darkMode");
  const [darkMode, setDarkMode] = useState(
    storedDarkMode === "true" ? true : false
  );

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    // Save dark mode setting to localStorage
    localStorage.setItem("darkMode", newDarkMode);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(
          `https://api.forexrateapi.com/v1/latest?api_key=${apiKey}&base=${baseCurrency}`
        );
        const res = await data.json();
        setRates(res.rates);
        setLastUpdate(res.timestamp);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [baseCurrency]);

  useEffect(() => {
    const fetchSupportedCurrencies = async () => {
      try {
        const response = await fetch(
          `https://api.forexrateapi.com/v1/symbols?api_key=${apiKey}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const res = await response.json();
        const allCurrencies = Object.keys(res.symbols || {}); // Ensure res.symbols is an object
        console.log("Supported Currencies:", allCurrencies); // Log the fetched currencies
        setSupportedCurrencies(allCurrencies);
      } catch (error) {
        console.error("Error fetching supported currencies:", error);
      }
    };

    fetchSupportedCurrencies();
  }, [apiKey]);

  // Sorting currencies based on selected option
  const sortedCurrencies = supportedCurrencies.sort((a, b) => {
    if (sortOption === "name") {
      return a.localeCompare(b);
    } else if (sortOption === "rate") {
      return Number(rates[a]) - Number(rates[b]);
    } else {
      // Handle other sorting options if needed
      return 0;
    }
  });

  // Pagination
  const indexOfLastCurrency = currentPage * currenciesPerPage;
  const indexOfFirstCurrency = indexOfLastCurrency - currenciesPerPage;
  const currentCurrencies = sortedCurrencies.slice(
    indexOfFirstCurrency,
    indexOfLastCurrency
  );

  const renderCurrencies = () => {
    if (supportedCurrencies.length === 0) {
      return (
        <tr>
          <td colSpan="2" className="text-center">
            Loading...
          </td>
        </tr>
      );
    }

    return currentCurrencies.map((currency) => (
      <tr
        key={currency}
        className={`transition-opacity duration-300 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
      >
        <td
          className={`border px-4 py-2 ${darkMode ? "text-white" : "text-black"
            }`}
        >
          {currency}
        </td>
        <td
          className={`border px-4 py-2 ${darkMode ? "text-white" : "text-black"
            }`}
        >
          {Number(rates[currency]).toFixed(2)}
        </td>
      </tr>
    ));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`flex flex-col items-center h-screen ${darkMode ? "dark" : ""
        }`}
    >
      <div
        className={`p-8 ${darkMode ? "bg-gray-800" : "bg-white"
          } shadow-md overflow-auto w-full`}
      >
        <div className="flex justify-between items-center">
          <h2
            className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-black"
              }`}
          >
            Forex Rates
          </h2>
          <button
            onClick={toggleDarkMode}
            className="text-white rounded-md w-[40px]"
          >
            {darkMode ? (
              <img
                title="light-mode"
                src="https://img.icons8.com/external-flat-papa-vector/78/external-Light-Mode-interface-flat-papa-vector.png"
                alt="external-Light-Mode-interface-flat-papa-vector"
                style={{ width: "40px", height: "40px" }} // Add this style
              />
            ) : (
              <img
                className="w-[40px]"
                title="dark-mode"
                src="https://img.icons8.com/ios-glyphs/30/moon-symbol.png"
                alt="Dark Icon"
              />
            )}
          </button>
        </div>

        {/* Base Currency Selector */}
        <div className="mb-4 flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <label
              htmlFor="baseCurrency"
              className={`block text-gray-700 ${darkMode ? "text-white" : "text-black"
                }`}
            >
              Select Base Currency:
            </label>
            <div className="relative min-w-fit">
              <select
                id="baseCurrency"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:border-blue-500"
              >
                {supportedCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <select
              value={sortOption}
              className="w-full px-4 py-2 border rounded-md appearance-none focus:outline-none focus:border-blue-500"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="rate">Sort by Rate</option>
            </select>
          </div>
        </div>

        {/* Forex Rates Table */}
        <table
          className={`w-full border-collapse mb-4 text-${darkMode ? "white" : "black"
            }`}
        >
          <thead>
            <tr>
              <th className="border px-4 py-2">Currency</th>
              <th className="border px-4 py-2">Rate</th>
            </tr>
          </thead>
          <tbody>{renderCurrencies()}</tbody>
        </table>

        {lastUpdate && (
          <p className={`mt-4 ${darkMode ? "text-white" : "text-black"}`}>
            Last Update: {new Date(lastUpdate * 1000).toLocaleString()}
          </p>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from(
            { length: Math.ceil(sortedCurrencies.length / currenciesPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ForexRates;
