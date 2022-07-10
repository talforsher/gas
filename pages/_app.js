import React, { useEffect } from "react";
import TagManager from 'react-gtm-module';

const tagManagerArgs = {
  gtmId: 'GTM-P49KKB6'
}

const App = ({ Component, pageProps }) => {

  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);

  return <Component {...pageProps} />;
};

export default App;
