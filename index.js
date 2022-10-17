const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const ALLOWED_ORIGIN = [
  "htpp://realstate.vercel.app",
  "https://realstate.vercel.app",
  "https://realstate.julianvidal.vercel.app",
  "http://realstate.julianvidal.vercel.app",
  "https://realstate-git-master-julianvidal.vercel.app",
  "http://realstate-git-master-julianvidal.vercel.app",
  "https://realstate-julianvidal.vercel.app",
  "http://realstate-julianvidal.vercel.app"
];

if (!process.env.DEPLOYED) {
  ALLOWED_ORIGIN.push("http://localhost:3000");
}

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (ALLOWED_ORIGIN.indexOf(origin) === -1) {
        console.log(`Blocked connection from ${origin}`);
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }

      console.log(`Accepted connection from ${origin}`);
      return callback(null, true);
    },
  })
);

app.get("/properties", async (req, res) => {
  const search = req.query.location;
  const option = req.query.type;
  let error;

  let auto_complete = await fetch(
    'https://realtor.p.rapidapi.com/locations/v2/auto-complete?input=' + search + '&limit=10',
    {
      method: "GET",
      headers: {
        'X-RapidAPI-Key': 'faace970c9mshb9a6dc176f9b095p1b3796jsn1ac808ba8436',
        'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
      },
    }
  )
    .then(async (response) => {
      return response.json();
    })
    .catch((err) => {
      error = new Error(err);
    });
  auto_complete = auto_complete.autocomplete;
  if (auto_complete === undefined || auto_complete.length === 0) {res.json({ data:undefined, error:new Error("Auto Complete fail") });return;}
  else auto_complete = auto_complete[0];

  // 'https://realtor.p.rapidapi.com/properties/v2/list-for-sale?city=Washington&limit=200&offset=0&sort=relevance'
  //  https://realtor.p.rapidapi.com/properties/v2/list-for-sale?city=Washington&limit=200&offset=0&sort=relevance undefined
  // 'https://realtor.p.rapidapi.com/properties/v2/list-for-sale?city=New%20York%20City&limit=200&state_code=NY&offset=0&sort=relevance'
  const data = await fetch(
      "https://realtor.p.rapidapi.com/properties/v2/list-for-" +
      option +
      "?city=" +
      search +
      "&state_code=" +
      auto_complete.state_code +
      "&limit=200&offset=0&sort=relevance"
      ,
    {
      method: "GET",
      headers: {
        'X-RapidAPI-Key': 'faace970c9mshb9a6dc176f9b095p1b3796jsn1ac808ba8436',
        'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
      },
    }
  )
    .then(async (response) => {
      return response.json();
    })
    .catch((err) => {
      error = new Error(err);
    });
    
  console.log("https://realtor.p.rapidapi.com/properties/v2/list-for-" +
      option +
      "?city=" +
      search +
      "&state_code=" +
      auto_complete.state_code +
      "&limit=200&offset=0&sort=relevance",data);
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
        "x-rapidapi-key": "c4608e73f8msh2cc5c53b3a9e8bbp1dcb3ajsn81d02860c74d",
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

app.listen(process.env.PORT || 4000);
