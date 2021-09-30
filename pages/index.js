import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import BootstrapTable from "react-bootstrap-table-next";
import { geolocated } from "react-geolocated";
import { NextSeo } from "next-seo";
import { AvatarGenerator } from "random-avatar-generator";
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
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

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
    dataField: "discount",
    text: "חיסכון ל50 ליטר"
  }
];

function App({ prices, coords, time, avatar }) {
  const router = useRouter();

  coords &&
    columns.push({
      dataField: "distance",
      text: "מרחק",
      sort: true,
      classes: styles.distance
    });

  const products = prices.map((station, i) => ({
    id: i,
    name: station.title,
    price: `${station.fuel_prices.customer_price.price} ₪`,
    discount: `${Number(
      station.fuel_prices.customer_price.discount.value * 50
    ).toFixed(2)} ₪`,
    distance: Math.round(
      distance(
        station.gps.lat,
        station.gps.lng,
        coords?.latitude,
        coords?.longitude
      )
    )
  }));

  const [lazy, setLazy] = useState(false);

  useEffect(() => {
    setLazy(true);
  }, []);

  return (
    <div className={styles.App}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NextSeo
        title="מלך הדלק 👑 השוואת מחירי דלק"
        canonical="https://deleking.co.il/"
        openGraph={{
          url: "https://www.deleking.co.il",
          title: "השוואת מחירי דלק הזול בישראל",
          description:
            "לקבלת המחיר הכי טוב לליטר בנזין, בתחנות הדלק הזולות הישראל. לחסוך בדלק ולצאת מלכות.",
          images: [
            {
              url: "https://deleking.co.il/crown.png",
              width: 264,
              height: 280,
              alt: "Og Image Alt",
              type: "image/jpeg"
            }
          ],
          site_name: "מלך הדלק"
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image"
        }}
      />
      <h1>תחנות הדלק הזולות בישראל</h1> 
      <div style={{ display: "grid" }}>
        {lazy && (
          <img
            src="/crown.png"
            style={{
              width: "143px",
              margin: "0 61px -93px",
              zIndex: 10
            }}
          />
        )}
        <img src={avatar.split("topType=")[0] + "topType=NoHair"} />
      </div>
      <h3>השוואת מחירי דלק בישראל</h3>
      <h4>
        מחיר לליטר בנזין | עדכון אחרון{" "}
        {new Date(time).toLocaleString("he-IL", {
          weekday: "long",
          hour12: false,
          hour: "numeric",
          minute: "2-digit"
        })}
      </h4>
      <BootstrapTable
        bootstrap4
        hover
        keyField="id"
        data={products}
        columns={columns}
        rowEvents={{
          onClick: (e, row, id) =>
            router.push({
              pathname: `/${row.name.replaceAll(" ", "").replace("Ten", "")}`
            })
        }}
      />
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
  const generator = new AvatarGenerator();
  const prices = await fetch(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  )
    .then((res) => res.json())
    .then((res) => res.data.stationsArr);
  return {
    props: {
      prices,
      time: new Date().getTime(),
      avatar: generator.generateRandomAvatar()
    },
    revalidate: 10000
  };
}

export default geolocated()(App);
