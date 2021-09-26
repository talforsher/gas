import { withRouter } from "next/router";
import React from "react";
import Head from "next/head";
import styles from "./styles.module.css";

const Page = ({ router: { query } }) => (
  <>
    <Head>
      <title>
        מלך הדלק | {query.name} | {query.price}
      </title>
    </Head>
    <div className={styles.App}>
      <h1>{query.name}</h1>
      <h2>{query.price} לליטר בנזין</h2>
      <h3>{query.distance} ק״מ ממך</h3>
      <h4>חיסכון של {query.discount} למכל מלא</h4>
    </div>
  </>
);

export default withRouter(Page);
