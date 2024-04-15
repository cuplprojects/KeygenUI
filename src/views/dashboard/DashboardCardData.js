import { useState, useEffect } from "react";
import { useUser } from "./../../context/UserContext";

const baseUrl = process.env.REACT_APP_BASE_URL;
const StatusUrl = `${baseUrl}/api/Papers/StatusCount`;

const DashboardCardData = () => {
  const { keygenUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState([]);
  const [statusCount, setStatusCount] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(StatusUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        const statusCountData = await response.json();
        setStatusCount(statusCountData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (statusCount.userCount !== undefined && statusCount.groupCount !== undefined && statusCount.keyGenerated !== undefined && statusCount.allPapersCount !== undefined) {
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
          iconClass: "fa-university",
          link: "/Groups",
          value: statusCount.groupCount,
          title: "Registered Groups",
        },
        {
          color: "lightgreen",
          iconClass: "fa-file-circle-check",
          link: "/KeyGenerator",
          value: statusCount.keyGenerated,
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
    }
  }, [statusCount]);

  return { cardData, loading, statusCount };
};

export default DashboardCardData;
