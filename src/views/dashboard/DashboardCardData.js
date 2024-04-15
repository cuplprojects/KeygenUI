// DashboardCardData.js
import { useState, useEffect } from "react";
import { useUser } from "./../../context/UserContext";

const baseUrl = process.env.REACT_APP_BASE_URL;
const StatusUrl = `${baseUrl}/api/Papers/StatusCount`;

const DashboardCardData = () => {
  const { keygenUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState([]);  // for card data 
  const [statusCount, setStatusCount] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(StatusUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        const statusCountData = await response.json();
        setStatusCount(statusCountData);

        setCardData([
          {
            color: "",
            iconClass: "fa-user",
            link: "/users",
            value: statusCount.userCount,
            title: "Registered user",
          },
          {
            color: "blue",
            iconClass: "fa-university ",
            link: "/Groups",
            value: statusCount.groupCount,
            title: "Registered Groups",
          },
          {
            color: "lightgreen",
            iconClass: "fa-file-circle-check",
            link: "/KeyGenerator",
            value:statusCount.keyGenerated,
            title: "Answer-Keys Generated",
          },
          {
            color: "red",
            iconClass: "fa-note-sticky",
            link: "/Masters/papers",
            value: statusCount.allPapersCount,
            title: "All Papers",
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [keygenUser]);

  return { cardData, loading, statusCount };
};

export default DashboardCardData;
