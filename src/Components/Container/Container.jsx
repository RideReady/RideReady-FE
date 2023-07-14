import { useEffect, useState } from "react";
import "./Container.css";
import PropTypes from "prop-types";
import Tile from "../Tile/Tile";

export default function Container({
  userSuspension,
  setSelectedSuspension,
  loadingSus,
}) {
  const [susTiles, setSusTiles] = useState([]);
  const [dashboardMessage, setDashboardMessage] = useState("Loading your suspension...");

  useEffect(() => {
    if (!userSuspension) return;
    if (userSuspension.length > 0 && !loadingSus) {
      setDashboardMessage(null);
      const suspensionTiles = userSuspension.map((sus) => {
        return (
          <Tile
            susDetails={sus}
            setSelectedSuspension={setSelectedSuspension}
            id={sus.id}
            key={sus.id}
          />
        );
      });
      setSusTiles(suspensionTiles);
    } else if (loadingSus == "error") {
      setDashboardMessage("An error occurred while loading your data. Please click the button below to try logging in again.");
    } else if (!loadingSus && userSuspension.length <= 0) {
      setDashboardMessage("No suspension to view. Add a new suspension part by clicking the button below.")
    }
    // eslint-disable-next-line
  }, [userSuspension, loadingSus]);

  return (
    <section className="container">
      {dashboardMessage ? <p className="add-new-mesg">{dashboardMessage}</p> : null}
      {susTiles}
    </section>
  );
}

Container.propTypes = {
  userSuspension: PropTypes.array,
  setSelectedSuspension: PropTypes.func,
  loadingSus: PropTypes.string,
};
