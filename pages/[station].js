import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AvatarGenerator } from "random-avatar-generator";
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

const Page = ({ currentStation, avatar, ...rest }) => (
  <div className={styles.App}>
    <Head>
      <title>
        מלך הדלק | {currentStation.title} |{" "}
        {currentStation.fuel_prices.customer_price.price}
      </title>
    </Head>
    <h1>{currentStation.title}</h1>
    <h2>
      {`${currentStation.fuel_prices.customer_price.price} ₪`} לליטר בנזין
    </h2>
    <h3>
      חיסכון של{" "}
      {`${Number(
        currentStation.fuel_prices.customer_price.discount.value * 50
      ).toFixed(2)} ₪`}
      למכל מלא
    </h3>
    <Link href="/">
      <a>
        <div style={{ display: "grid" }}>
          <img
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
  </div>
);

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
  const avatar = await fetch(
    generator.generateRandomAvatar().split("topType=")[0] + "topType=NoHair"
  ).then((res) => res.text());
  return {
    props: {
      currentStation,
      time: new Date().getTime(),
      avatar
    },
    revalidate: 10000
  };
}

export default Page;
