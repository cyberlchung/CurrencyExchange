import React, {useState, useEffect} from "react";
import './App.css';
import fetch from "unfetch";
import useSWR from "swr";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem
} from "@material-ui/core";

const API_URL = "https://openexchangerates.org/api/";

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

var today = new Date();
var date = today.yyyymmdd();;

const fetcher = async path => {
  const res = await fetch(API_URL + path);
  const json = await res.json();
  //console.log(json);

  if (json.hasOwnProperty('error'))
    return null;
  else
    return json;
};

function App() {
  
  const [append, setAppend] = useState("latest.json?app_id=34cc8962cc9f40cd82d7ca701e0312a3");

  const { data: currencies } = useSWR(append, fetcher);

  const [fromValue, setFromValue] = useState(1);
  const [toValue, setToValue] = useState(1);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("USD");

  const [updated, setUpdated] = useState(true);

  const handleFromCurrencyChange = e => {
    setFromCurrency(e.target.value);
  };

  const handleToCurrencyChange = e => {
    setToCurrency(e.target.value);
  };

  const handleFromValueChange = e => {
    setFromValue(parseFloat(e.target.value));
  };

  const handleToValueChange = e => {
    setToValue(parseFloat(e.target.value));
  };

  const convertFromTo = () => {
    if (!currencies) return;
    const fromRate =
      fromCurrency === "USD" ? 1 : currencies.rates[fromCurrency];
    const valueInUsd = fromValue / fromRate;
    const toRate = toCurrency === "USD" ? 1 : currencies.rates[toCurrency];
    setToValue(valueInUsd * toRate);
  };

  const convertToFrom = () => {
    if (!currencies) return;
    const toRate = toCurrency === "USD" ? 1 : currencies.rates[toCurrency];
    const valueInUsd = toValue / toRate;
    const fromRate =
      fromCurrency === "USD" ? 1 : currencies.rates[fromCurrency];
    setFromValue(valueInUsd * fromRate);
  };

  useEffect(() => {
    convertFromTo();
  }, [fromValue, toCurrency, currencies]);

  useEffect(() => {
    convertToFrom();
  }, [toValue, fromCurrency]);

  return (
    <Container className="currency-exchange-container" fixed>
      <h1>Currency exchange</h1>
      <Paper
        className="currency-exchange-paper"
        variant="outlined"
        elavation={1}
      >
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              type="number"
              value={currencies? fromValue : ""}
              onChange={handleFromValueChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="number"
              value={currencies? toValue : ""}
              onChange={handleToValueChange}
            />
          </Grid>
          <Grid item xs={6}>
            <Select value={currencies? fromCurrency : ""} onChange={handleFromCurrencyChange}>
              {currencies? Object.keys(currencies.rates).map((rate, key) => (
                <MenuItem key={key} value={rate}>
                  {rate}
                </MenuItem>
              )): null}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <Select value={currencies? toCurrency : ""} onChange={handleToCurrencyChange}>
              {currencies? Object.keys(currencies.rates).map((rate, key) => (
                <MenuItem key={key} value={rate}>
                  {rate}
                </MenuItem>
              )): null}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              defaultValue={date}
              onChange={event => {
                //console.log(event.target.value)
                if (event.target.value != "" && event.target.value <= date ) {
                  setAppend("historical/" + event.target.value + ".json?app_id=34cc8962cc9f40cd82d7ca701e0312a3");
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default App;
