import React from "react";
import Head from "next/head";
import {
  getAuthor,
  getFeaturedImage,
  getAllPostsFromServer
} from "../../lib/utils";

const Post = ({ post }) => (
  <>
    <Head>
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
      <title>מלך הדלק</title>
    </Head>
    <div dangerouslySetInnerHTML={{ __html: post }}></div>
  </>
);

export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const posts = await getAllPostsFromServer();

  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post) => {
    return {
      params: {
        post: post.title.rendered.split(" ").join("-")
      }
    };
  });

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const posts = await getAllPostsFromServer();
  return {
    props: {
      post: posts.find(
        (post) => post.title.rendered.split(" ").join("-") === params.post
      ).content.rendered
    },
    revalidate: 10000
  };
}

export default Post;
