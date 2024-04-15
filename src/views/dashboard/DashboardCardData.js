// DashboardCardData.js
import { useState, useEffect } from "react";
import { useUser } from "./../../context/UserContext";

const apiUrl = process.env.REACT_APP_API_USERS;
const UniUrl = process.env.REACT_APP_API_GROUP;
const baseUrl = process.env.REACT_APP_BASE_URL;
const keysUrl = `${baseUrl}/api/Papers`;

const DashboardCardData = () => {
  const { keygenUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState([]);
  const [papersStatusCount, setPapersStatusCount] = useState({
    keyGenerated: 0,
    masterUploaded: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataResponse, uniDataResponse, keysResponse] = await Promise.all([
          fetch(apiUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }),
          fetch(UniUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }),
          fetch(keysUrl, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
        ]);

        const userData = await userDataResponse.json();
        const uniData = await uniDataResponse.json();
        const keysData = await keysResponse.json();

        const generatedKeys = keysData.filter((key) => key.keyGenerated === true);

        const papersStatus = keysData.reduce((acc, key) => {
          if (key.keyGenerated) {
            acc.keyGenerated++;
          } else if (key.masterUploaded && !key.keyGenerated) {
            acc.masterUploaded++;
          } else {
            acc.pending++;
          }
          return acc;
        }, { keyGenerated: 0, masterUploaded: 0, pending: 0 });

        setPapersStatusCount(papersStatus);

        setCardData([
          {
            color: "",
            iconClass: "fa-user",
            link: "/users",
            value: userData.length,
            title: "Registered user",
          },
          {
            color: "blue",
            iconClass: "fa-university ",
            link: "/Groups",
            value: uniData.length,
            title: "Registered Groups",
          },
          {
            color: "lightgreen",
            iconClass: "fa-file-circle-check",
            link: "/KeyGenerator",
            value: generatedKeys.length,
            title: "Answer-Keys Generated",
          },
          {
            color: "red",
            iconClass: "fa-note-sticky",
            link: "/Masters/papers",
            value: keysData.length,
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

  return { cardData, loading, papersStatusCount };
};

export default DashboardCardData;
