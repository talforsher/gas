import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import BootstrapTable from "react-bootstrap-table-next";
import { geolocated } from "react-geolocated";
import { NextSeo } from "next-seo";
import cx from "classnames";
import { AvatarGenerator } from "random-avatar-generator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./styles.module.css";
import Link from "next/link";

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

function App({ prices, coords, time, avatar, month, posts }) {
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

  const Table = () => (
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
  );

  useEffect(() => {
    [...document.querySelectorAll("tbody > tr >:first-child")].map((el) => {
      const a = document.createElement("a");
      const td = document.createElement("td");
      td.className = styles.td;
      a.href = el.innerText.replaceAll(" ", "").replace("Ten", "");
      a.className = styles.contents;
      td.innerHTML = el.innerHTML;
      a.appendChild(td);
      el.parentElement.replaceChild(a, el);
    });
  }, [coords, Table]);

  return (
    <div className={styles.App}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <script
          defer
          data-ad-client="ca-pub-9455771214890409"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        ></script>
        <script
          defer
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9455771214890409"
          crossOrigin="anonymous"
        ></script>
        <script
          defer
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RXGQZDCBCL"
        />

        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RXGQZDCBCL', { page_path: window.location.pathname });
            `
          }}
        />
      </Head>
      <NextSeo
        title={`מלך הדלק 👑 השוואת מחירי דלק ${month}`}
        canonical="https://deleking.co.il/"
        openGraph={{
          url: "https://www.deleking.co.il",
          title: `השוואת מחירי דלק ${month} הזול בישראל`,
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
          site_name: `מלך הדלק ${month}`
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image"
        }}
      />
      <header>
        <nav className="navbar justify-content-center navbar-light border">
          <header className="navbar-brand">כתבות:</header>
          {posts.map((title) => (
            <Link key={title} href={`/article/${title}`}>
              <a className={cx("nav-link", styles.navLink)}>{title}</a>
            </Link>
          ))}
        </nav>
        <h1>תחנות הדלק הזולות בישראל לחודש {month}</h1> 
        <div style={{ display: "grid" }}>
          <img
            alt="אווטר של מלך הדלק"
            src="/crown.png"
            style={{
              width: "143px",
              margin: "0 auto -93px auto",
              zIndex: 10
            }}
          />
          <span dangerouslySetInnerHTML={{ __html: avatar }} />
        </div>
        <h2>
          מחיר לליטר בנזין | עדכון אחרון{" "}
          {new Date(time).toLocaleString("he-IL", {
            weekday: "long",
            hour12: false,
            hour: "numeric",
            minute: "2-digit"
          })}
        </h2>
        <h3>השוואת מחירי דלק בישראל | מיון לפי:</h3>
      </header>
      <Table />
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
  const avatar = await fetch(
    generator
      .generateRandomAvatar()
      .split("topType=")[0]
      .replace("Circle", "Transparent") + "topType=NoHair"
  ).then((res) => res.text());

  const posts = await fetch(
    "https://hackathon.co.il/wp-json/wp/v2/posts?categories=4"
  )
    .then((res) => res.json())
    .then((res) => res.map(({ title }) => title.rendered));

  return {
    props: {
      prices,
      time: new Date().getTime(),
      avatar,
      month: [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר"
      ][new Date().getMonth()],
      posts
    },
    revalidate: 10000
  };
}

export default geolocated()(App);
