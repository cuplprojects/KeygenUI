import { useState, useEffect } from "react";
import { useUser } from "./../../context/UserContext";

const apiUrl = process.env.REACT_APP_API_USERS;
const UniUrl = process.env.REACT_APP_API_GROUP;
const baseUrl = process.env.REACT_APP_BASE_URL;
const keysUrl = `${baseUrl}/api/Papers`;

const DashboardCardData = () => {
  const { keygenUser } = useUser();
  const [userCount, setUserCount] = useState(0);
  const [uniCount, setUniCount] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [allpapersCount, setAllpapersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, uniDataResponse, keysResponse] = await Promise.all([
          fetch(apiUrl,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } }),
          fetch(UniUrl,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } }),
          fetch(keysUrl,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } })
        ]);

        const userData = await userDataResponse.json();
        const uniData = await uniDataResponse.json();
        const keysData = await keysResponse.json();

        const generatedKeys = keysData.filter((key) => key.keyGenerated === true);
        const allPapers = keysData;

        setUserCount(userData.length);
        setUniCount(uniData.length);
        setGeneratedCount(generatedKeys.length);
        setAllpapersCount(allPapers.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [keygenUser]);

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
      color: "lightgreen",
      iconClass: "fa-file-circle-check",
      link: "/KeyGenerator",
      value: generatedCount,
      title: "Answer-Keys Generated",
    },
    {
      color: "red",
      iconClass: "fa-note-sticky",
      link: "/Masters/papers",
      value: allpapersCount,
      title: "All Papers",
    },
  ];

  return { cardData, loading };
};

export default DashboardCardData;
