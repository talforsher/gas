import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AvatarGenerator } from "random-avatar-generator";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./styles.module.css";

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str, newStr) {
    // If a regex pattern
    if (
      Object.prototype.toString.call(str).toLowerCase() === "[object regexp]"
    ) {
      return this.replace(str, newStr);
    }

    // If a string
    return this.replace(new RegExp(str, "g"), newStr);
  };
}

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

const Page = ({ currentStation, nextStation, avatar, month, wiki }) => {
  return (
    <div className={`${styles.App} ${styles.station}`}>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9455771214890409"
          crossOrigin="anonymous"
        ></script>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RXGQZDCBCL"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RXGQZDCBCL', { page_path: window.location.pathname });
            `
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <title>
          מלך הדלק | {currentStation.title} |{" "}
          {currentStation.fuel_prices.customer_price.price}
        </title>
      </Head>
      <a
        style={{
          fontSize: "3rem",
          padding: "2rem, 0",
          textDecoration: "unset"
        }}
        href="/"
      >
        ➡️
      </a>
      <header className={styles.nameAndImage}>
        <h1> בתחנת {currentStation.title}</h1>
        <img
          src={wiki.image}
          alt={currentStation.title}
          title={currentStation.title}
        />
      </header>
      <article>
        <h2>
          ליטר בנזין עולה רק{" "}
          {`${currentStation.fuel_prices.customer_price.price} ₪`}
        </h2>
        <h3>
          שזה חיסכון של
          {`${Number(
            currentStation.fuel_prices.customer_price.discount.value * 50
          ).toFixed(2)} ₪`}{" "}
          למכל
        </h3>
      </article>
      <h4>
        המחיר המלא שממנו נגזרת ההנחה, הוא המחיר שמשרד האנרגיה הגדיר לחודש{" "}
        {month}
      </h4>
      <Link href="/">
        <a>
          <div style={{ display: "grid" }}>
            <img
              alt="אווטר של מלך הדלק"
              src="/crown.png"
              style={{
                width: "143px",
                margin: "0 61px -93px",
                zIndex: 10
              }}
            />
            <span dangerouslySetInnerHTML={{ __html: avatar }} />
          </div>
        </a>
      </Link>
      <p className={styles.paragraph}>{wiki.text}</p>
      <footer>
        בתחנת{" "}
        <Link href={nextStation.title.replaceAll(" ", "").replace("Ten", "")}>
          {nextStation.title}
        </Link>{" "}
        מחיר ליטר בנזין - {nextStation.fuel_prices.customer_price.price}
      </footer>
    </div>
  );
};

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const res = await fetch(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  );
  const stations = await res.json();

  // Get the paths we want to pre-render based on posts
  const paths = stations.data.stationsArr.map((row) => {
    return {
      params: {
        station: row.title.replaceAll(" ", "").replace("Ten", "")
      }
    };
  });

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const generator = new AvatarGenerator();
  const stations = await fetch(
    "https://10ten.co.il/website_api/website/1.0/generalDeclaration"
  )
    .then((res) => res.json())
    .then((res) => res.data.stationsArr);

  const currentStation = stations.find((e) => {
    return e.title.replaceAll(" ", "").replace("Ten", "") === params.station;
  });

  const nextStation = stations[currentStation.id - 1] || stations[0];
  const avatar = await fetch(
    generator.generateRandomAvatar().split("topType=")[0] + "topType=NoHair"
  ).then((res) => res.text());

  const wikiURL = encodeURI(
    "https://he.wikipedia.org/w/api.php?action=query&titles=" +
      currentStation.title.replace("Ten ", "").split("-")[0] +
      "&prop=revisions&rvprop=content&format=json&prop=extracts|pageimages&exintro&explaintext&redirects=1&origin=*&pithumbsize=150"
  );

  const wikidata = await new Promise(function (resolve, reject) {
    setTimeout(
      () => {
        const request = fetch(wikiURL);
        resolve(request);
      },
      process.env.NODE_ENV === "development" ? 0 : 15000
    );
  });

  const json = await wikidata.json();
  const wiki = {
    text: Object.values(json.query.pages)[0].extract || null,
    image: Object.values(json.query.pages)[0].thumbnail?.source || null
  };

  return {
    props: {
      currentStation,
      nextStation,
      time: new Date().getTime(),
      avatar,
      wiki,
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
      ][new Date().getMonth()]
    },
    revalidate: 10000
  };
}

export default Page;
