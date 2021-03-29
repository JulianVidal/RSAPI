const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const ALLOWED_ORIGIN = ["realstate.vercel.app"];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (ALLOWED_ORIGIN.indexOf(origin) === -1) {
      console.log(`Blocked connection from ${origin}`)
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`
      return callback(new Error(msg), false)
    }
    
    console.log(`Accepted connection from ${origin}`)
    return callback(null, true)
  }
}));

app.get("/properties", async (req, res) => {
  const search = req.query.location;
  const option = req.query.type;
  let error;
  const data = await fetch(
    "https://realtor.p.rapidapi.com/properties/v2/list-for-" +
      option +
      "?city=" +
      search +
      "&limit=100&offset=0&sort=relevance",
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": "faace970c9mshb9a6dc176f9b095p1b3796jsn1ac808ba8436",
        "x-rapidapi-host": "realtor.p.rapidapi.com",
      },
    }
  )
    .then(async (response) => {
      return response.json();
    })
    .catch((err) => {
      error = new Error(err);
    });
  console.log(data);
  res.json({ data, error });
});

app.get("/property", async (req, res) => {
  const propertyID = req.query.property_id;
  let error;
  const data = await fetch(
    "https://realtor.p.rapidapi.com/properties/v2/detail?property_id=" +
      propertyID,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": "faace970c9mshb9a6dc176f9b095p1b3796jsn1ac808ba8436",
        "x-rapidapi-host": "realtor.p.rapidapi.com",
      },
    }
  )
    .then(async (response) => {
      return response.json();
    })
    .catch((err) => {
      error = err;
    });
  console.log(data);
  res.json({ data, error });
});

app.listen(process.env.PORT || 5000);
