import React from "react";
import Head from "next/head";
import {
  AppBar,
  Container,
  Typography,
  Toolbar,
  Link,
  Paper,
} from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { Bar } from "react-chartjs-2";
import useSWR from "swr";

export default function Home() {
  return (
    <div>
      <Head>
        <title>yes-collection results</title>
        <meta
          name="description"
          content="Comparison of speeds of yes programs roughly written in each language."
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 style=%22dominant-baseline:central;text-anchor:middle;font-size:90px;%22>⌛</text></svg>"
        />
      </Head>

      <AppBar>
        <Toolbar>
          <Typography variant="h6"> yes-collection results </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" fixed style={{ marginTop: "92px" }}>
        <Paper>
          <Chart />
        </Paper>
        <Paper style={{ marginTop: "2rem" }}>
          <div style={{ width: "100%", height: "80vh" }}>
            <Grid />
          </div>
        </Paper>
        <Typography style={{ marginTop: "2rem" }}>
          This page renders{" "}
          <Link href="https://github.com/yskszk63/yes-collection">
            yskszk63/yes-collection
          </Link>{" "}
          results.
        </Typography>
      </Container>
    </div>
  );
}

function Chart() {
  const { data, isLoading, isError } = useData();
  if (isError) {
    return <div>failed to load data.</div>;
  }
  if (isLoading) {
    return <div>loading..</div>;
  }

  const chartdata = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "min (bytes/ms)",
        data: data.map((d) => d.min),
        backgroundColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "max (bytes/ms)",
        data: data.map((d) => d.max),
        backgroundColor: "rgba(255, 99, 132, 1)",
      },
      {
        label: "avg (bytes/ms)",
        data: data.map((d) => d.avg),
        backgroundColor: "rgba(255, 206, 86, 1)",
      },
    ],
  };

  return (
    <Bar type="horizontalBar" data={chartdata} options={{ indexAxis: "y" }} />
  );
}

function Grid() {
  const columns = [
    { field: "name", headerName: "name", width: 200 },
    { field: "min", headerName: "min (bytes/ms)", type: "number", width: 180 },
    { field: "max", headerName: "max (bytes/ms)", type: "number", width: 180 },
    { field: "avg", headerName: "avg (bytes/ms)", type: "number", width: 180 },
    { field: "num", headerName: "samples", type: "number", width: 150 },
  ];

  const { data, isLoading, isError } = useData();
  if (isError) {
    return <div>failed to load data.</div>;
  }
  if (isLoading) {
    return <div>loading..</div>;
  }

  return <DataGrid columns={columns} rows={data} />;
}

async function fetcher(url: string) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) {
    throw new Error(`failed to fetch ${url} ${response.status}`);
  }
  return response.text();
}

function useData() {
  const { data, error } = useSWR(
    "https://yskszk63.github.io/yes-collection/results.txt",
    fetcher
  );
  return {
    data: data && aggregate(data),
    isLoading: !error && !data,
    isError: error,
  };
}

function aggregate(text: string) {
  const rawdata = text
    .split(/$/gm)
    .filter((line) => !!line.trim())
    .map((line) => line.trim().split(/\t/gm))
    .map(([name, seq, val]) => ({
      name,
      seq: Number(seq),
      val: Number(val),
    }));
  const groupby: { [key: string]: [number] } = rawdata.reduce((obj, cur) => {
    const key = cur.name;
    (obj[key] || (obj[key] = [])).push(cur.val);
    return obj;
  }, {});
  const aggregate = Object.entries(groupby).map(([name, values]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((r, v) => (r = r + v), 0) / values.length;
    return {
      id: name,
      name,
      min,
      max,
      avg,
      num: values.length,
    };
  });
  return aggregate;
}
