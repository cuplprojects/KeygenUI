import { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_USERS;
const UniUrl = process.env.REACT_APP_API_GROUP;
// const keyUrl = 'http://api2.chandrakala.co.in/api/Papers';

const DashboardCardData = () => {
  const [userCount, setUserCount] = useState(0);
  const [uniCount, setUniCount] = useState(0);
  // const [keyCount, setKeyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, uniDataResponse] = await Promise.all([
          fetch(apiUrl),
          fetch(UniUrl),
          // fetch(keyUrl)
        ]);
        const userData = await userDataResponse.json();
        const uniData = await uniDataResponse.json();
        // const keyData = await keyDataResponse.json();


        setUserCount(userData.length);
        setUniCount(uniData.length);
        // setKeyCount(keyData.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardData = [
    {
      color: "",
      iconClass: "fa-user",
      link: "/users",
      value: userCount,
      title: "Registered user",
    },
    {
      color: "blue",
      iconClass: "fa-university ",
      link: "/Groups",
      value: uniCount,
      title: "Registered Groups",
    },
    {
      color: "red",
      iconClass: "fa-file-circle-question",
      link: "/KeyGenerator",
      value: 0,
      title: "Answer-Keys Generated",
    },
    {
      color: "lightgreen",
      iconClass: "fa-clock-rotate-left",
      link: "/users4",
      value: 0,
      title: "Pending Keys",
    },
  ];

  return { cardData, loading };
};

export default DashboardCardData;
