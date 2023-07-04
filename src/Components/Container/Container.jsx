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

  // Need to rethink this noSus / loading message to
  // maybe a switch statement to add a third case where
  // loading from DB fails and shows user a message saying loading from
  // DB failed. Show a reload button that tries the request again
  // or tells them to return to home page?

  const [dashboardMessage, setDashboardMessage] = useState(null);

  // const loadingMessage = (
  //   <p className="add-new-mesg">Loading your suspension...</p>
  // );

  useEffect(() => {
    if (userSuspension && !loadingSus) {
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
    } else if (loadingSus) {
      setDashboardMessage(loadingSus);
    } else if (!loadingSus && !userSuspension) {
      setDashboardMessage("No suspension to view. Add a new suspension part by clicking the button below.")
    }
    // eslint-disable-next-line
  }, [userSuspension, loadingSus]);

  return (
    <section className="container">
      <p className="add-new-mesg">{dashboardMessage}</p>
      {susTiles}
    </section>
  );
}

Container.propTypes = {
  userSuspension: PropTypes.array,
  setSelectedSuspension: PropTypes.func,
  loadingSus: PropTypes.string,
};
