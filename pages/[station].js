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
      <h2>{query.price}</h2>
      <h3>{query.distance}</h3>
      <h4>{query.discount}</h4>
    </div>
  </>
);

export default withRouter(Page);
