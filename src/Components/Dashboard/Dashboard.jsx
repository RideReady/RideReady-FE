import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../Container/Container";
import "./Dashboard.css";
import PropTypes from "prop-types";

export default function Dashboard({
  userSuspension,
  setUserSuspension,
  setSelectedSuspension,
  userBikes,
  setUserBikes,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (userBikes === null) {
      const loadedBikes = JSON.parse(localStorage.getItem("userBikes"));
      setUserBikes(loadedBikes);
    }
    if (userSuspension === null) {
      const loadedSus = JSON.parse(localStorage.getItem("userSuspension"));
      if (loadedSus === null) {
        setUserSuspension([])
      } else {
        setUserSuspension(loadedSus)
      }
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (userSuspension === null) return;
    if (userSuspension.length === 0) {
      // API call
      
      // assign userSuspension
    }
  }, [userSuspension])

  useEffect(() => {
    if (userBikes) {
      window.localStorage.setItem("userBikes", JSON.stringify(userBikes));
    }
  }, [userBikes]);

  return (
    <section className="dashboard">
      <h1 className="site-logo">Ride Ready</h1>
      <Container
        userSuspension={userSuspension}
        setSelectedSuspension={setSelectedSuspension}
      />
      <button id="dash-add-sus" onClick={() => navigate('/dashboard/add-new-part')}>Add new suspension</button>
    </section>
  );
}

Dashboard.propTypes = {
  userSuspension: PropTypes.array,
  setUserSuspension: PropTypes.func,
  setSelectedSuspension: PropTypes.func,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
};
