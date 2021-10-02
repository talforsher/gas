import React, { useEffect } from "react";
import { useRouter } from "next/router";

const App = ({ Component, pageProps }) => {
  const router = useRouter();

  const handleRouteChange = (url) => {
    window.gtag("config", "G-RXGQZDCBCL", {
      page_path: url
    });
  };

  useEffect(() => {
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
};

export default App;