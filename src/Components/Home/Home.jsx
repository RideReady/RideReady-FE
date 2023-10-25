import { useEffect } from "react";
import "./Home.css";

export default function Home() {
  const clientID = import.meta.env.VITE_CLIENT_ID;
  const redirectUrl= import.meta.env.VITE_REDIRECT_URL;

  useEffect(() => {
    window.localStorage.clear();
  }, []);

  const loginUser = () => {
    window.location = `http://www.strava.com/oauth/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=auto&scope=activity:read_all`;
  };

  return (
    <section className="home-page">
      <div className="home-content">
        <h1 className="site-logo">Ride Ready</h1>
        <h2 className="tag-line">
          Mountain Bike Suspension Service Life Tracker
        </h2>
        <button onClick={loginUser}>Log in with Strava</button>
        <p className="notes">
          <b>Important notes about this app:</b> You must have a Strava account
          to use this app. For accurate service life calculations, you must log
          all of your rides with Strava and also use the &quot;Gear&quot;
          feature to designate which bike you were riding on each ride.
        </p>
      </div>
    </section>
  );
}
