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
  const [noSuspensionMessage, setNoSuspensionMessage] = useState(
    <p className="add-new-mesg">
      No suspension to view. Add a new suspension part by clicking the button
      below.
    </p>
  );

  const loadingMessage = (
    <p className="add-new-mesg">Loading your suspension...</p>
  );

  useEffect(() => {
    if (userSuspension) {
      setNoSuspensionMessage(null);
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
    }
    // eslint-disable-next-line
  }, [userSuspension]);

  return (
    <section className="container">
      {loadingSus ? loadingMessage : noSuspensionMessage}
      {susTiles}
    </section>
  );
}

Container.propTypes = {
  userSuspension: PropTypes.array,
  setSelectedSuspension: PropTypes.func,
  loadingSus: PropTypes.bool,
};
