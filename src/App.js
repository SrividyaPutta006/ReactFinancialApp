import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

function App() {
  const [symbol, setSymbol] = useState('IBM');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const incomeResponse = await axios.get(
          `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${process.env.REACT_APP_API_KEY}`
        );
        const balanceResponse = await axios.get(
          `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${process.env.REACT_APP_API_KEY}`
        );

        const netIncome = incomeResponse.data.quarterlyReports.map(report => parseFloat(report.netIncome));
        const totalRevenue = incomeResponse.data.quarterlyReports.map(report => parseFloat(report.totalRevenue));
        const totalEquity = balanceResponse.data.quarterlyReports.map(report => parseFloat(report.totalShareholderEquity));
        const labels = incomeResponse.data.quarterlyReports.map(report => report.fiscalDateEnding);

        setData({
          labels,
          datasets: [
            { label: 'Net Income', data: netIncome, borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', },
            { label: 'Total Revenue', data: totalRevenue, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', },
            { label: 'Shareholder Equity', data: totalEquity, borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', }
          ]
        });
      } catch (err) {
        setError('Failed to fetch data. Please check the stock symbol and internet connection.');
        setData(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (data && data.labels && data.datasets && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: true
            }
          } 
        }
      });
    }
  }, [data]);  

  const handleSymbolChange = (event) => {
    setSymbol(event.target.value.toUpperCase());
  };

  return (
    <div>
      <h1>Financial Charts for {symbol}</h1>
      <input type="text" value={symbol} onChange={handleSymbolChange} placeholder="Enter Stock Symbol" />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default App;
