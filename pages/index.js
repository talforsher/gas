import React, { useEffect, useRef, useState } from "react";
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
import { useDebounce } from "use-debounce";

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
  Animation: true,
  animation: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 0.6,
      to: 0.7,
      loop: true
    }
  },
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
  labels: ["פברואר 21", "מרץ 21", "אפריל 21", "מאי 21",
    "יוני 21", "יולי 21", "אוגוסט 21", "ספטמבר 21", "אוקטובר 21", "נובמבר 21",
    "דצמבר 21", "ינואר 22", "פברואר 22", "מרץ 22", "אפריל 22", "מאי 22", "יוני 22", "יולי 22", "אוגוסט 22"],
  datasets: [
    {
      label: "בנזין 95",
      data: [
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
        8.08,
        6.58
      ],
      borderColor: '#F9F871',
      backgroundColor: '#F9F871',
    },
    {
      label: "ביטקוין",
      data: [
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
        166,
        197
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

const Modal = ({ show, onClose, children, modalOpacity }) => {

  return (
    <div style={{
      textAlign: 'right',
      position: 'fixed',
      zIndex: '99',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: show ? 'flex' : 'none',
      opacity: modalOpacity,
      transition: 'opacity 0.3s ease-in-out',
    }}>
      <section style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        width: '80%',
        height: '80%',
        WebkitOverflowScrolling: 'touch',
        outline: 'none'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '20px'
        }}>
          <div onClick={onClose} style={{
            cursor: 'pointer',
            color: '#000',
            fontSize: '50px',
            fontWeight: 'bold'
          }}>×</div>
        </div>
        {children}
      </section>
    </div>
  )
}

function App({ prices, coords, time, avatar, month, posts }) {
  const router = useRouter();
  const [filteredPrices, setFilteredPrices] = useState(prices);
  const [filter, setFilter] = useState("");
  const [value] = useDebounce(filter, 500);
  const [showModal, setShowModal] = useState(false);
  const [modalOpacity, setModalOpacity] = useState(0);
  const [beforeTextEntered, setBeforeTextEntered] = useState(true);
  const onClose = () => {
    setTimeout(() => {
      setShowModal(false);
    }, 500);
    setModalOpacity(0);
  }

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
    if (value.length > 1) {
      const fuse = new Fuse(prices, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ["title"]
      });
      const result = fuse.search(value);
      setFilteredPrices(result.map((x) => x.item));
    }
    else {
      setFilteredPrices(prices);
    }
  }, [value, prices]);


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

  const input = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowModal(true);
      setModalOpacity(1);
      input.current.autoFocus = true;
      input.current.focus();
    }, 20_000);
    return () => clearTimeout(timeout);
  }, []);

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
        canonical="https://www.deleking.co.il/"
        openGraph={{
          url: "https://www.deleking.co.il",
          title: `השוואת מחירי דלק הזול בישראל`,
          description:
            "לקבלת המחיר הכי טוב לליטר בנזין, בתחנות הדלק הזולות הישראל. לחסוך בדלק ולצאת מלכות.",
          images: [
            {
              url: "https://www.deleking.co.il/crown.png",
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
      <Modal show={showModal} onClose={onClose} modalOpacity={modalOpacity}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80%',
          color: '#000'
        }}>
          <textarea ref={input} type="text" placeholder="איזה תחנה חסרה פה?" style={{
            width: '100%',
            textAlign: 'center',
            height: '100%',
            border: 'none',
            outline: 'none',
            fontSize: 'calc(1rem + 1vw)',
            padding: '0.5rem',
            margin: '0.5rem',
            
          }} />
          <button style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '1.5rem',
            padding: '0.5rem',
            margin: '0.5rem'
          }}
            onClick={() => {
              setShowModal(false);
              onClose();
            }
            }>בקשת הוספה</button>
          <a href="https://linkedin.com/in/talforsher" style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            padding: '0.5rem',
            margin: '0.5rem',
            textDecoration: 'none',
            textAlign: 'center',
            color: '#000'
          }}>Developed by Tal Forsher</a>

        </div>
      </Modal>
      <header>
        <h1>תחנות הדלק הזולות בישראל<br />לחודש {month}</h1>
        {beforeTextEntered && (
        <div style={{
          maxWidth: "1000px",
          backgroundColor: "#77b2ff",
          borderRadius: "10px",
          border: "1px solid #ffffff59",
        }}>
          <Line options={options} data={data} />
        </div>
        )}
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
        <input placeholder="נסו 'חיפה או 'אילת''" type="text" value={filter} onChange={(e) => {
          setBeforeTextEntered(false)
          setFilter(e.target.value)
          }} />
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
