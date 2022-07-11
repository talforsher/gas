import React, { useEffect, useState } from "react";
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
import axios from "axios";
import Fuse from 'fuse.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  borderWidth: 1,
  elements: {
    point: {
      radius: 1,
      hitRadius: 15,
      hoverRadius: 15,
      hoverBorderWidth: 3,
    }
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'גרף מחירי דלק בישראל',
    },
  },
};

export const data = {
  labels: ["ינואר 21", "פברואר 21", "מרץ 21", "אפריל 21", "מאי 21",
    "יוני 21", "יולי 21", "אוגוסט 21", "ספטמבר 21", "אוקטובר 21", "נובמבר 21",
    "דצמבר 21", "ינואר 22", "פברואר 22", "מרץ 22", "אפריל 22", "מאי 22", "יוני 22", "יולי 22"],
  datasets: [
    {
      label: "בנזין 95",
      data: [
        5.51,
        5.72,
        5.99,
        6.04,
        6.06,
        6.13,
        6.31,
        6.36,
        6.31,
        6.39,
        6.62,
        6.38,
        6.37,
        6.71,
        7.05,
        7.44,
        6.94,
        7.06,
        7.72,
        8.08
      ],
      borderColor: '#F9F871',
      backgroundColor: '#F9F871',
    },
    {
      label: "ביטקוין",
      data: [
        241,
        323,
        427,
        417,
        262,
        253,
        299,
        342,
        325,
        448,
        428,
        342,
        286,
        321,
        346,
        299,
        252,
        166,
        166
      ].map((x) => (x / 50).toFixed(2)),
      borderColor: 'black',
      backgroundColor: 'black',
    }
  ]
};

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

function App({ prices, coords, time, avatar, month, posts }) {
  const router = useRouter();
  const [filteredPrices, setFilteredPrices] = useState(prices);
  const [filter, setFilter] = useState("");
  const [columns, setColumns] = useState([
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
  ]);

  useEffect(() => {
    if (filter.length > 1) {
      const fuse = new Fuse(prices, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title"]
      });
      const result = fuse.search(filter);
      setFilteredPrices(result.map((x) => x.item));
    }
    else {
      setFilteredPrices(prices);
    }
  }, [filter, prices]);


  useEffect(() => {
    if (coords) {
      setColumns([
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
        },
        {
          dataField: "distance",
          text: "מרחק",
          sort: true,
          classes: styles.distance
        }
      ]);
    }
  }, [coords]);

  const products = filteredPrices.map((station, i) => ({
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
      </Head>
      <NextSeo
        title={`מלך הדלק 👑 השוואת מחירי דלק 2022`}
        canonical="https://deleking.co.il/"
        openGraph={{
          url: "https://www.deleking.co.il",
          title: `השוואת מחירי דלק הזול בישראל`,
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
          site_name: `מלך הדלק 2022`
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image"
        }}
      />
      <header>
        <h1>תחנות הדלק הזולות בישראל לחודש {month}</h1>
        <div style={{ maxWidth: "1000px" }}>
        <Line options={options} data={data} />
        </div>
        <div className={styles.navbar}>
          <ul className={cx("nav")}>
            {posts.map((title) => (
              <Link key={title} href={`/article/${title}`}>
                <li className="nav-item">
                  <a className={cx("nav-link", styles.navLink)}>{title}</a>
                </li>
              </Link>
            ))}
          </ul>
        </div>
        <div className={styles.kingAndNav}>
          <div />
          <img
            alt="אווטר של מלך הדלק"
            src="/crown.png"
            className={styles.crown}
          />
          <span
            className={styles.king}
            dangerouslySetInnerHTML={{ __html: avatar }}
          />
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
        <input placeholder="נסו 'חיפה'" type="text" onChange={(e) => setFilter(e.target.value)} />
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
  const posts = [];
  // await axios(
  //   "https://hackathon.co.il/wp-json/wp/v2/posts?author=4"
  // )
  //   .then((res) => res.data.map(({ title }) => title.rendered));
  const generator = new AvatarGenerator();
  const prices = await axios(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  )
    .then((res) => res.data.data.stationsArr);
  const avatar = await axios(
    generator
      .generateRandomAvatar()
      .split("topType=")[0]
      .replace("Circle", "Transparent") + "topType=NoHair"
  )

  return {
    props: {
      posts,
      prices,
      time: new Date().getTime(),
      avatar: avatar.data,
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
      ][new Date(new Date().getTime() + 48 * 60 * 60 * 1000).getMonth()]
    },
    revalidate: 5000
  };
}

export default geolocated()(App);
