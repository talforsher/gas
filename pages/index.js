import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";

export default function App({ prices }) {
  return (
    <div className={styles.App}>
      <h1>תחנות הדלק הזולות בישראל</h1> <h3>השוואת מחירים</h3>
      <ul>
        {prices.map((station) => (
          <li key={station.title}>
            {station.title} | {station.fuel_prices.customer_price.price}₪
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps(preview = true) {
  const prices = await fetch(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  )
    .then((prices) => prices.json())
    .then((prices) =>
      prices.data.stationsArr.sort((a, b) =>
        a.fuel_prices.customer_price.price <
          b.fuel_prices.customer_price.price && -1
      )
    );
  return {
    props: {
      prices
    }
  };
}
