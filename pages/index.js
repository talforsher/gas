import React from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./styles.module.css";

export default function App({ prices }) {
  return (
    <div className={styles.App}>
      <Head>
        <title>מלך הדלק | השוואת מחירי דלק</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <h1>תחנות הדלק הזולות בישראל</h1> <h3>השוואת מחירים</h3>
      <ul className="list-group list-group-flush">
        {prices.map((station, index) => (
          <button
            style={{ background: `rgb(${index * 4},${255 - index * 4},0)` }}
            className="list-group-item list-group-item-action"
            key={station.title}
          >
            {station.title} | {station.fuel_prices.customer_price.price}₪
          </button>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps(preview = false) {
  const prices = await fetch(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  )
    .then((res) => res.json())
    .then((res) => res.data.stationsArr);
  prices.sort(
    (a, b) =>
      a.fuel_prices.customer_price.price < b.fuel_prices.customer_price.price &&
      -1
  );
  return {
    props: {
      prices
    }
  };
}
