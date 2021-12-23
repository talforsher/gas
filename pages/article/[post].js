import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AvatarGenerator } from "random-avatar-generator";
import "bootstrap/dist/css/bootstrap.css";
import styles from "../styles.module.css";

const Page = ({ avatar, post }) => {
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
        <title>👑 מלך הדלק | {post.title}</title>
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
      <header>
        <h1>{post.title}</h1>
      </header>
      <article>
        <p
          className={styles.paragraph}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <Link href="/">
        <a>
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
        </a>
      </Link>
    </div>
  );
};

export const getStaticPaths = async () => {
  const posts = await fetch(
    "https://hackathon.co.il/wp-json/wp/v2/posts?categories=4"
  )
    .then((res) => res.json())
    .then((res) =>
      res.map(({ title, content }) => ({
        title: title.rendered,
        content: content.rendered
      }))
    );

  return {
    paths: posts.map(({ title }) => ({
      params: { post: title }
    })),
    fallback: false // fallback is set to false because we already know the slugs ahead of time
  };
};

export async function getStaticProps({ params }) {
  const generator = new AvatarGenerator();
  const avatar = await fetch(
    generator
      .generateRandomAvatar()
      .split("topType=")[0]
      .replace("Circle", "Transparent") + "topType=NoHair"
  ).then((res) => res.text());

  const post = await fetch(
    "https://hackathon.co.il/wp-json/wp/v2/posts?categories=4"
  )
    .then((res) => res.json())
    .then((res) => res.find(({ title }) => title.rendered === params.post));

  return {
    props: {
      avatar,
      post: { title: post.title.rendered, content: post.content.rendered }
    }
  };
}

export default Page;
