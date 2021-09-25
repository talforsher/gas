import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Table } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import { geolocated } from "react-geolocated";
import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import styles from "./styles.module.css";

const toRad = (Value) => {
  return (Value * Math.PI) / 180;
};

const distance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

const columns = [
  {
    dataField: "name",
    text: "תחנה",
    sort: false
  },
  {
    dataField: "price",
    text: "מחיר",
    sort: true
  },
  {
    dataField: "distance",
    text: "מרחק",
    sort: true
  }
];

function App({ prices, coords }) {
  const products = prices.map((station, i) => ({
    id: i,
    name: station.title,
    price: station.fuel_prices.customer_price.price,
    distance: Math.round(
      distance(
        station.gps.lat,
        station.gps.lng,
        coords?.latitude,
        coords?.longitude
      )
    )
  }));

  return (
    <div className={styles.App}>
      <Head>
        <title>מלך הדלק | השוואת מחירי דלק</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      lat: {coords?.latitude} | long: {coords?.longitude}
      <h1>תחנות הדלק הזולות בישראל</h1> <h3>השוואת מחירים</h3>
      <BootstrapTable keyField="id" data={products} columns={columns} />
      {/* <Table>
        <tbody>
          {prices.map((station) => (
            <tr
              key={station.title}
              style={{
                background: `rgb(${
                  station.fuel_prices.customer_price.price ** 2.7
                },${255 - station.fuel_prices.customer_price.price ** 2.7},0)`
              }}
            >
              <td>{station.title}</td>
              <td>{station.fuel_prices.customer_price.price}₪</td>
              <td>
                {Math.round(
                  distance(
                    station.gps.lat,
                    station.gps.lng,
                    coords?.latitude,
                    coords?.longitude
                  )
                )}{" "}
                ק״מ
              </td>
            </tr>
          ))}
        </tbody>
      </Table> */}
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

export default geolocated()(App);
