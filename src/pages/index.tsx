import React from 'react';
import Head from 'next/head'
import { AppBar, Container, Typography, Toolbar, Link, Paper } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { Bar } from 'react-chartjs-2';

export default function Home({ data }) {
  const columns = [
    { field: 'name', headerName: 'name', width: 200, },
    { field: 'min', headerName: 'min (bytes/ms)', type: 'number', width: 180, },
    { field: 'max', headerName: 'max (bytes/ms)', type: 'number', width: 180, },
    { field: 'avg', headerName: 'avg (bytes/ms)', type: 'number', width: 180, },
    { field: 'num', headerName: 'samples', type: 'number', width: 150, },
  ];

  const chartdata = {
    labels: data.map(d => d.name),
    datasets: [
      {
        label: 'max',
        data: data.map(d => d.max),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'min',
        data: data.map(d => d.min),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'avg',
        data: data.map(d => d.avg),
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
  };

  return (
    <div>
      <Head>
        <title>yes-collection results</title>
        <meta name="description" content="Comparison of speeds of yes programs roughly written in each language." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <AppBar>
        <Toolbar>
          <Typography variant="h6"> yes-collection results </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" fixed style={{ marginTop: '92px' }}>
        <Paper>
          <Bar type='horizontalBar' data={chartdata} options={options}/>
        </Paper>
        <Paper style={{ marginTop: '2rem' }}>
          <div style={{ width: '100%', height: '80vh' }}>
            <DataGrid columns={columns} rows={data} />
          </div>
        </Paper>
        <Typography style={{ marginTop: '2rem' }}>
          This page renders <Link href="https://github.com/yskszk63/yes-collection">yskszk63/yes-collection</Link> results.
        </Typography>
      </Container>
    </div>
  )
}

export async function getServerSideProps() {
  const res = await fetch('https://yskszk63.github.io/yes-collection/results.txt', { mode: 'cors' });
  const tsv = await res.text();
  const data = tsv.split(/$/gm)
    .filter(line => !!line.trim())
    .map(line => line.trim().split(/\t/gm))
    .map(([name, seq, val]) => Object.assign({id: `${name}-${seq}`, name, seq: Number(seq), val: Number(val)}));
  const groupby: {string: [number]} = data.reduce((obj, cur) => {
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
    }
  });
  return {
    props: {
      data: aggregate,
    }
  }
}
