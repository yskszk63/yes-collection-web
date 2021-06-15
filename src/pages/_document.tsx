import Document, { Html, Head, Main, NextScript } from "next/document";
class CustomDocument extends Document {
  render() {
    return (
      <Html>
        <Head></Head>
        <body>
          <Main />
          <NextScript />
          <script></script>
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
