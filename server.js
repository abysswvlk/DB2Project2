// Import required modules
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');

// MongoDB connection URI
const uri = "mongodb+srv://project2:NGtUMFKBLbHNnWT8@cluster0.yhoc5sp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Serve static files from the 'public' directory
app.use(express.static('public'));

//FirstJob
// Function to upload first job CSV data to MongoDB
async function uploadFirstJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average homicide victims per country
    const averageHomicideCollection = db.collection('averageHomicideVictimsPerCountry');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const countryName = data.Country;
        const homicideAverage = parseFloat(data.HomicideAverage);

        // Check if the country already exists in the collection
        const existingCountry = await averageHomicideCollection.findOne({ country: countryName });

        if (existingCountry) {
          // Update the existing document with new homicide average
          await averageHomicideCollection.updateOne(
            { country: countryName },
            { $set: { average: homicideAverage } }
          );
        } else {
          // Create a new document for the country
          const homicide = {
            average: homicideAverage,
            country: countryName,
          };
          await averageHomicideCollection.insertOne(homicide);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload the first job CSV data to MongoDB
app.post('/api/upload-first-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/firstJobResult/part-r-00000.csv');

  uploadFirstJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getFirstJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average homicide victims per country
    const averageHomicideCollection = db.collection('averageHomicideVictimsPerCountry');

    // Retrieve all documents from the collection
    const data = await averageHomicideCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the first job data from MongoDB
app.get('/api/get-first-job-data', async (req, res) => {
  try {
    const data = await getFirstJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the country names for the first job from MongoDB
app.get('/api/get-countries-first-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average homicide victims per country
    const averageHomicideCollection = db.collection('averageHomicideVictimsPerCountry');

    // Retrieve all documents from the collection
    const data = await averageHomicideCollection.find().toArray();

    // Transform the data to include only the country names
    const countryNames = data.map(entry => entry.country);

    res.json(countryNames);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Second Job
// Function to upload homicides by region CSV data to MongoDB
async function uploadSecondJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region
    const homicidesByRegionCollection = db.collection('homicidesByRegion');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const regionName = data.Region;
        const year = parseFloat(data.Year);
        const averageHomicides = parseFloat(data.Average);
        const maxHomicides = parseFloat(data.Maximum);
        const minHomicides = parseFloat(data.Minimum);

        // Check if the region already exists in the collection for the given year
        const existingRegion = await homicidesByRegionCollection.findOne({ region: regionName, year });

        if (existingRegion) {
          // Update the existing document with new homicide data
          await homicidesByRegionCollection.updateOne(
            { region: regionName, year },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the region and year
          const homicides = {
            region: regionName,
            year,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesByRegionCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by region CSV data to MongoDB
app.post('/api/upload-second-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/secondJobResult/part-r-00000.csv');

  uploadSecondJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getSecondJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region
    const homicidesByRegionCollection = db.collection('homicidesByRegion');

    // Retrieve all documents from the collection
    const data = await homicidesByRegionCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by region data from MongoDB
app.get('/api/get-second-job-data', async (req, res) => {
  try {
    const data = await getSecondJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the region names for homicides by region data from MongoDB
app.get('/api/get-regions-second-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region
    const homicidesByRegionCollection = db.collection('homicidesByRegion');

    // Retrieve all documents from the collection
    const data = await homicidesByRegionCollection.find().toArray();

    // Transform the data to include only the region names
    const regionNames = data.map(entry => entry.region);

    res.json(regionNames);
  } catch (error) {
    console.error('Error retrieving regions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years for homicides by region
app.get('/api/get-years-second-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region
    const homicidesByRegionCollection = db.collection('homicidesByRegion');

    // Perform an aggregation query to retrieve the distinct years
    const years = await homicidesByRegionCollection.distinct('year');

    res.json(years);
  } catch (error) {
    console.error('Error retrieving years from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Third job
// Function to upload homicides by subRegion CSV data to MongoDB
async function uploadThirdJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion
    const homicidesBysubRegionCollection = db.collection('homicidesBysubRegion');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const subRegionName = data.subRegion;
        const year = parseFloat(data.Year);
        const averageHomicides = parseFloat(data.Average);
        const maxHomicides = parseFloat(data.Maximum);
        const minHomicides = parseFloat(data.Minimum);

        // Check if the subRegion already exists in the collection for the given year
        const existingsubRegion = await homicidesBysubRegionCollection.findOne({ subRegion: subRegionName, year });

        if (existingsubRegion) {
          // Update the existing document with new homicide data
          await homicidesBysubRegionCollection.updateOne(
            { subRegion: subRegionName, year },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the subRegion and year
          const homicides = {
            subRegion: subRegionName,
            year,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesBysubRegionCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by subRegion CSV data to MongoDB
app.post('/api/upload-third-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/thirdJobResult/part-r-00000.csv');

  uploadThirdJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getThirdJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion
    const homicidesBysubRegionCollection = db.collection('homicidesBysubRegion');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by subRegion data from MongoDB
app.get('/api/get-third-job-data', async (req, res) => {
  try {
    const data = await getThirdJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the subRegion names for homicides by subRegion data from MongoDB
app.get('/api/get-subRegions-third-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion
    const homicidesBysubRegionCollection = db.collection('homicidesBysubRegion');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionCollection.find().toArray();

    // Transform the data to include only the subRegion names
    const subRegionNames = data.map(entry => entry.subRegion);

    res.json(subRegionNames);
  } catch (error) {
    console.error('Error retrieving subRegions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years for homicides by subRegion
app.get('/api/get-years-third-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion
    const homicidesBysubRegionCollection = db.collection('homicidesBysubRegion');

    // Perform an aggregation query to retrieve the distinct years
    const years = await homicidesBysubRegionCollection.distinct('year');

    res.json(years);
  } catch (error) {
    console.error('Error retrieving years from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fourth job
// Function to upload data by Country and Sex CSV to MongoDB
async function uploadFourthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and Sex
    const dataByCountryAndSexCollection = db.collection('dataByCountryAndSex');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const sex = data.Sex;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and sex
        const existingDocument = await dataByCountryAndSexCollection.findOne({ country, sex });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAndSexCollection.updateOne(
            { country, sex },
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and sex
          const newData = {
            country,
            sex,
            average,
          };
          await dataByCountryAndSexCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and Sex CSV data to MongoDB
app.post('/api/upload-fourth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/fourthJobResult/part-r-00000.csv');

  uploadFourthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the fourth job
async function getFourthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and Sex
    const dataByCountryAndSexCollection = db.collection('dataByCountryAndSex');

    // Perform an aggregation query to group the data by country and sex
    const data = await dataByCountryAndSexCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and Sex from MongoDB
app.get('/api/get-fourth-job-data', async (req, res) => {
  try {
    const data = await getFourthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the fourth job
app.get('/api/get-countries-fourth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and Sex
    const dataByCountryAndSexCollection = db.collection('dataByCountryAndSex');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAndSexCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the sex options for the fourth job
app.get('/api/get-sex-fourth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and Sex
    const dataByCountryAndSexCollection = db.collection('dataByCountryAndSex');

    // Perform an aggregation query to retrieve the distinct sex options
    const sexOptions = await dataByCountryAndSexCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving sex options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fifth job
// Function to upload homicides by region and sex CSV data to MongoDB
async function uploadFifthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSex');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const regionName = data.region;
        const year = parseFloat(data.year);
        const sex = data.sex;
        const averageHomicides = parseFloat(data.average);
        const maxHomicides = parseFloat(data.maximum);
        const minHomicides = parseFloat(data.minimum);

        // Check if the region, year, and sex combination already exists in the collection
        const existingEntry = await homicidesByregionSexCollection.findOne({
          region: regionName,
          year,
          sex,
        });

        if (existingEntry) {
          // Update the existing document with new homicide data
          await homicidesByregionSexCollection.updateOne(
            { region: regionName, year, sex },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the region, year, and sex combination
          const homicides = {
            region: regionName,
            year,
            sex,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesByregionSexCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by region and sex CSV data to MongoDB
app.post('/api/upload-fifth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/fifthJobResult/part-r-00000.csv');

  uploadFifthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getFifthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSex');

    // Retrieve all documents from the collection
    const data = await homicidesByregionSexCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by region and sex data from MongoDB
app.get('/api/get-fifth-job-data', async (req, res) => {
  try {
    const data = await getFifthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the region names for homicides by region and sex data from MongoDB
app.get('/api/get-regions-fifth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSex');

    // Retrieve all documents from the collection
    const data = await homicidesByregionSexCollection.find().toArray();

    // Transform the data to include only the region names
    const regionNames = data.map((entry) => entry.region);

    res.json(regionNames);
  } catch (error) {
    console.error('Error retrieving regions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years for homicides by region and sex
app.get('/api/get-years-fifth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSex');

    // Perform an aggregation query to retrieve the distinct years
    const years = await homicidesByregionSexCollection.distinct('year');

    res.json(years);
  } catch (error) {
    console.error('Error retrieving years from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the available sex options for homicides by region and sex
app.get('/api/get-sex-fifth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSex');

    // Perform an aggregation query to retrieve the distinct sex values
    const sexOptions = await homicidesByregionSexCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving sex options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sixth job
// Function to upload homicides by subRegion and sex CSV data to MongoDB
async function uploadSixthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSex');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const subRegionName = data.subRegion;
        const year = parseFloat(data.year);
        const sex = data.sex;
        const averageHomicides = parseFloat(data.average);
        const maxHomicides = parseFloat(data.maximum);
        const minHomicides = parseFloat(data.minimum);

        // Check if the subRegion, year, and sex combination already exists in the collection
        const existingEntry = await homicidesBysubRegionSexCollection.findOne({
          subRegion: subRegionName,
          year,
          sex,
        });

        if (existingEntry) {
          // Update the existing document with new homicide data
          await homicidesBysubRegionSexCollection.updateOne(
            { subRegion: subRegionName, year, sex },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the subRegion, year, and sex combination
          const homicides = {
            subRegion: subRegionName,
            year,
            sex,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesBysubRegionSexCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by subRegion and sex CSV data to MongoDB
app.post('/api/upload-sixth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/sixthJobResult/part-r-00000.csv');

  uploadSixthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getSixthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSex');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionSexCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by subRegion and sex data from MongoDB
app.get('/api/get-sixth-job-data', async (req, res) => {
  try {
    const data = await getSixthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the subRegion names for homicides by subRegion and sex data from MongoDB
app.get('/api/get-subRegions-sixth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSex');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionSexCollection.find().toArray();

    // Transform the data to include only the subRegion names
    const subRegionNames = data.map((entry) => entry.subRegion);

    res.json(subRegionNames);
  } catch (error) {
    console.error('Error retrieving subRegions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years for homicides by subRegion and sex
app.get('/api/get-years-sixth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSex');

    // Perform an aggregation query to retrieve the distinct years
    const years = await homicidesBysubRegionSexCollection.distinct('year');

    res.json(years);
  } catch (error) {
    console.error('Error retrieving years from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the available sex options for homicides by subRegion and sex
app.get('/api/get-sex-sixth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSex');

    // Perform an aggregation query to retrieve the distinct sex values
    const sexOptions = await homicidesBysubRegionSexCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving sex options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Seventh job
// Function to upload homicides by region and sex CSV data to MongoDB
async function uploadSeventhJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSexDecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const regionName = data.region;
        const decade = parseFloat(data.decade);
        const sex = data.sex;
        const averageHomicides = parseFloat(data.average);
        const maxHomicides = parseFloat(data.maximum);
        const minHomicides = parseFloat(data.minimum);

        // Check if the region, decade, and sex combination already exists in the collection
        const existingEntry = await homicidesByregionSexCollection.findOne({
          region: regionName,
          decade,
          sex,
        });

        if (existingEntry) {
          // Update the existing document with new homicide data
          await homicidesByregionSexCollection.updateOne(
            { region: regionName, decade, sex },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the region, decade, and sex combination
          const homicides = {
            region: regionName,
            decade,
            sex,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesByregionSexCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by region and sex CSV data to MongoDB
app.post('/api/upload-seventh-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/seventhJobResult/part-r-00000.csv');

  uploadSeventhJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getSeventhJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSexDecade');

    // Retrieve all documents from the collection
    const data = await homicidesByregionSexCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by region and sex data from MongoDB
app.get('/api/get-seventh-job-data', async (req, res) => {
  try {
    const data = await getSeventhJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the region names for homicides by region and sex data from MongoDB
app.get('/api/get-regions-seventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSexDecade');

    // Retrieve all documents from the collection
    const data = await homicidesByregionSexCollection.find().toArray();

    // Transform the data to include only the region names
    const regionNames = data.map((entry) => entry.region);

    res.json(regionNames);
  } catch (error) {
    console.error('Error retrieving regions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decades for homicides by region and sex
app.get('/api/get-decades-seventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSexDecade');

    // Perform an aggregation query to retrieve the distinct decades
    const decades = await homicidesByregionSexCollection.distinct('decade');

    res.json(decades);
  } catch (error) {
    console.error('Error retrieving decades from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the available sex options for homicides by region and sex
app.get('/api/get-sex-seventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by region and sex
    const homicidesByregionSexCollection = db.collection('homicidesByregionSexDecade');

    // Perform an aggregation query to retrieve the distinct sex values
    const sexOptions = await homicidesByregionSexCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving sex options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Eighth job
// Function to upload homicides by subRegion and sex CSV data to MongoDB
async function uploadEighthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSexDecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const subRegionName = data.subRegion;
        const decade = parseFloat(data.decade);
        const sex = data.sex;
        const averageHomicides = parseFloat(data.average);
        const maxHomicides = parseFloat(data.maximum);
        const minHomicides = parseFloat(data.minimum);

        // Check if the subRegion, decade, and sex combination already exists in the collection
        const existingEntry = await homicidesBysubRegionSexCollection.findOne({
          subRegion: subRegionName,
          decade,
          sex,
        });

        if (existingEntry) {
          // Update the existing document with new homicide data
          await homicidesBysubRegionSexCollection.updateOne(
            { subRegion: subRegionName, decade, sex },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the subRegion, decade, and sex combination
          const homicides = {
            subRegion: subRegionName,
            decade,
            sex,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesBysubRegionSexCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by subRegion and sex CSV data to MongoDB
app.post('/api/upload-eighth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/eighthJobResult/part-r-00000.csv');

  uploadEighthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getEighthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSexDecade');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionSexCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by subRegion and sex data from MongoDB
app.get('/api/get-eighth-job-data', async (req, res) => {
  try {
    const data = await getEighthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the subRegion names for homicides by subRegion and sex data from MongoDB
app.get('/api/get-subRegions-eighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSexDecade');

    // Retrieve all documents from the collection
    const data = await homicidesBysubRegionSexCollection.find().toArray();

    // Transform the data to include only the subRegion names
    const subRegionNames = data.map((entry) => entry.subRegion);

    res.json(subRegionNames);
  } catch (error) {
    console.error('Error retrieving subRegions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decades for homicides by subRegion and sex
app.get('/api/get-decades-eighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSexDecade');

    // Perform an aggregation query to retrieve the distinct decades
    const decades = await homicidesBysubRegionSexCollection.distinct('decade');

    res.json(decades);
  } catch (error) {
    console.error('Error retrieving decades from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the available sex options for homicides by subRegion and sex
app.get('/api/get-sex-eighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by subRegion and sex
    const homicidesBysubRegionSexCollection = db.collection('homicidesBysubRegionSexDecade');

    // Perform an aggregation query to retrieve the distinct sex values
    const sexOptions = await homicidesBysubRegionSexCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving sex options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ninth job
// Function to upload data by Country, Year and Disease CSV to MongoDB
async function uploadNinthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and Disease
    const DeathStats30to70Collection = db.collection('DeathStats30to70');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.country;
        const year = data.year;
        const disease = data.disease;
        const average = parseFloat(data.average);

        // Check if the document already exists in the collection for the given country and disease
        const existingDocument = await DeathStats30to70Collection.findOne({ country, year, disease });

        if (existingDocument) {
          // Update the existing document with new average data
          await DeathStats30to70Collection.updateOne(
            { country, year, disease },
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and disease
          const newData = {
            country,
            year,
            disease,
            average,
          };
          await DeathStats30to70Collection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country Year and Disease CSV data to MongoDB
app.post('/api/upload-ninth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/ninthJobResult/part-r-00000.csv');

  uploadNinthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the Ninth job
async function getNinthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and disease
    const DeathStats30to70Collection = db.collection('DeathStats30to70');

    // Perform an aggregation query to group the data by country and disease
    const data = await DeathStats30to70Collection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and disease from MongoDB
app.get('/api/get-ninth-job-data', async (req, res) => {
  try {
    const data = await getNinthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the Ninth job
app.get('/api/get-countries-ninth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and disease
    const DeathStats30to70Collection = db.collection('DeathStats30to70');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await DeathStats30to70Collection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years options for the ninth job
app.get('/api/get-years-ninth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and disease
    const DeathStats30to70Collection = db.collection('DeathStats30to70');

    // Perform an aggregation query to retrieve the distinct disease options
    const yearOptions = await DeathStats30to70Collection.distinct('year');

    res.json(yearOptions);
  } catch (error) {
    console.error('Error retrieving disease options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the years options for the ninth job
app.get('/api/get-disease-ninth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and disease
    const DeathStats30to70Collection = db.collection('DeathStats30to70');

    // Perform an aggregation query to retrieve the distinct dissease options
    const diseaseOptions = await DeathStats30to70Collection.distinct('disease');

    res.json(diseaseOptions);
  } catch (error) {
    console.error('Error retrieving disease options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Tenth Job
// Function to upload homicides by country CSV data to MongoDB
async function uploadTenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('homicidesByCauseAndCountry');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const countryName = data.country;
        const cause = data.cause;
        const averageHomicides = parseFloat(data.Average);
        const maxHomicides = parseFloat(data.Maximum);
        const minHomicides = parseFloat(data.Minimum);

        // Check if the country already exists in the collection for the given cause
        const existingcountry = await homicidesBycountryCollection.findOne({ country: countryName, cause });

        if (existingcountry) {
          // Update the existing document with new homicide data
          await homicidesBycountryCollection.updateOne(
            { country: countryName, cause },
            {
              $set: {
                average: averageHomicides,
                maximum: maxHomicides,
                minimum: minHomicides,
              },
            }
          );
        } else {
          // Create a new document for the country and cause
          const homicides = {
            country: countryName,
            cause,
            average: averageHomicides,
            maximum: maxHomicides,
            minimum: minHomicides,
          };
          await homicidesBycountryCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by country CSV data to MongoDB
app.post('/api/upload-tenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/tenthJobResult/part-r-00000.csv');

  uploadTenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getTenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('homicidesByCauseAndCountry');

    // Retrieve all documents from the collection
    const data = await homicidesBycountryCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by country data from MongoDB
app.get('/api/get-tenth-job-data', async (req, res) => {
  try {
    const data = await getTenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the country names for homicides by country data from MongoDB
app.get('/api/get-countries-tenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('homicidesByCauseAndCountry');

    // Retrieve all documents from the collection
    const data = await homicidesBycountryCollection.find().toArray();

    // Transform the data to include only the country names
    const countryNames = data.map(entry => entry.country);

    res.json(countryNames);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the causes for homicides by country
app.get('/api/get-causes-tenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('homicidesByCauseAndCountry');

    // Perform an aggregation query to retrieve the distinct causes
    const causes = await homicidesBycountryCollection.distinct('cause');

    res.json(causes);
  } catch (error) {
    console.error('Error retrieving causes from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Eleventh Job
// Function to upload homicides by country CSV data to MongoDB
async function uploadEleventhJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('ageByfirstYearLastYearAndCountry');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const countryName = data.country;
        const firstYear = data.firstYear;
        const difference = parseFloat(data.difference);
        const lastYear = data.lastYear;
        const firstDate = data.firstDate;
        const lastDate = data.lastDate;

        // Check if the country already exists in the collection for the given firstYear
        const existingcountry = await homicidesBycountryCollection.findOne({ country: countryName });

        if (existingcountry) {
          // Update the existing document with new homicide data
          await homicidesBycountryCollection.updateOne(
            { country: countryName, firstYear },
            {
              $set: {
                difference: difference,
                lastYear: lastYear,
                firstYear: firstYear,
                firstDate: firstDate,
                lastDate: lastDate,
              },
            }
          );
        } else {
          // Create a new document for the country and firstYear
          const homicides = {
            country: countryName,
            firstYear,
            difference: difference,
            lastYear: lastYear,
            firstDate: firstDate,
            lastDate: lastDate,
          };
          await homicidesBycountryCollection.insertOne(homicides);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload homicides by country CSV data to MongoDB
app.post('/api/upload-eleventh-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/eleventhJobResult/part-r-00000.csv');

  uploadEleventhJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getEleventhJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('ageByfirstYearLastYearAndCountry');

    // Retrieve all documents from the collection
    const data = await homicidesBycountryCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the homicides by country data from MongoDB
app.get('/api/get-eleventh-job-data', async (req, res) => {
  try {
    const data = await getEleventhJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the country names for homicides by country data from MongoDB
app.get('/api/get-countries-eleventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('ageByfirstYearLastYearAndCountry');

    // Retrieve all documents from the collection
    const data = await homicidesBycountryCollection.find().toArray();

    // Transform the data to include only the country names
    const countryNames = data.map(entry => entry.country);

    res.json(countryNames);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the firstYears for homicides by country
app.get('/api/get-firstYears-eleventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('ageByfirstYearLastYearAndCountry');

    // Perform an aggregation query to retrieve the distinct firstYears
    const firstYears = await homicidesBycountryCollection.distinct('firstDate');

    res.json(firstYears);
  } catch (error) {
    console.error('Error retrieving firstYears from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the lastYears for homicides by country
app.get('/api/get-lastYears-eleventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for homicides by country
    const homicidesBycountryCollection = db.collection('ageByfirstYearLastYearAndCountry');

    // Perform an aggregation query to retrieve the distinct firstYears
    const lastYears = await homicidesBycountryCollection.distinct('lastDate');

    res.json(lastYears);
  } catch (error) {
    console.error('Error retrieving firstYears from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twelfth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadtwelfthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('ageByCountryAnddecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            average,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-twelfth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twelfthJobResult/part-r-00000.csv');

  uploadtwelfthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twelfth job
async function gettwelfthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('ageByCountryAnddecade');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-twelfth-job-data', async (req, res) => {
  try {
    const data = await gettwelfthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the twelfth job
app.get('/api/get-countries-twelfth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('ageByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the twelfth job
app.get('/api/get-decade-twelfth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('ageByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//thirtiethJob
// Function to upload thirtieth job CSV data to MongoDB
async function uploadthirtiethJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average population victims per decade
    const averagepopulationCollection = db.collection('averagepopulationVictimsPerdecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const decadeName = data.decade;
        const populationAverage = parseFloat(data.populationAverage);

        // Check if the decade already exists in the collection
        const existingdecade = await averagepopulationCollection.findOne({ decade: decadeName });

        if (existingdecade) {
          // Update the existing document with new population average
          await averagepopulationCollection.updateOne(
            { decade: decadeName },
            { $set: { average: populationAverage } }
          );
        } else {
          // Create a new document for the decade
          const population = {
            average: populationAverage,
            decade: decadeName,
          };
          await averagepopulationCollection.insertOne(population);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload the thirtieth job CSV data to MongoDB
app.post('/api/upload-thirtieth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/thirtiethJobResult/part-r-00000.csv');

  uploadthirtiethJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function getthirtiethJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average population victims per decade
    const averagepopulationCollection = db.collection('averagepopulationVictimsPerdecade');

    // Retrieve all documents from the collection
    const data = await averagepopulationCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the thirtieth job data from MongoDB
app.get('/api/get-thirtieth-job-data', async (req, res) => {
  try {
    const data = await getthirtiethJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade names for the thirtieth job from MongoDB
app.get('/api/get-decades-thirtieth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for average population victims per decade
    const averagepopulationCollection = db.collection('averagepopulationVictimsPerdecade');

    // Retrieve all documents from the collection
    const data = await averagepopulationCollection.find().toArray();

    // Transform the data to include only the decade names
    const decadeNames = data.map(entry => entry.decade);

    res.json(decadeNames);
  } catch (error) {
    console.error('Error retrieving decades from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fourteenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadfourteenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryAnddecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            average,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-fourteenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/fourteenthJobResult/part-r-00000.csv');

  uploadfourteenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the fourteenth job
async function getfourteenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryAnddecade');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-fourteenth-job-data', async (req, res) => {
  try {
    const data = await getfourteenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the fourteenth job
app.get('/api/get-countries-fourteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the fourteenth job
app.get('/api/get-decade-fourteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// fifteenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadfifteenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryDecadeAndQuintile');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const quintile = data.quintile;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade, quintile });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade, quintile},
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            quintile,
            average,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-fifteenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/fifteenthJobResult/part-r-00000.csv');

  uploadfifteenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the fifteenth job
async function getfifteenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryDecadeAndQuintile');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-fifteenth-job-data', async (req, res) => {
  try {
    const data = await getfifteenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the fifteenth job
app.get('/api/get-countries-fifteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the fifteenth job
app.get('/api/get-decade-fifteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the quintile options for the fifteenth job
app.get('/api/get-quintile-fifteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fertilityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct decade options
    const quintileOptions = await dataByCountryAnddecadeCollection.distinct('quintile');

    res.json(quintileOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// sixteenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadsixteenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryAnddecade');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            average,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-sixteenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/sixteenthJobResult/part-r-00000.csv');

  uploadsixteenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the sixteenth job
async function getsixteenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryAnddecade');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-sixteenth-job-data', async (req, res) => {
  try {
    const data = await getsixteenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the sixteenth job
app.get('/api/get-countries-sixteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the sixteenth job
app.get('/api/get-decade-sixteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryAnddecade');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// seventeenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadseventeenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryDecadeAndQuintile');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const quintile = data.quintile;
        const average = parseFloat(data.Average);

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade, quintile });

        if (existingDocument) {
          // Update the existing document with new average data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade, quintile},
            {
              $set: {
                average,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            quintile,
            average,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-seventeenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/seventeenthJobResult/part-r-00000.csv');

  uploadseventeenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the seventeenth job
async function getseventeenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryDecadeAndQuintile');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-seventeenth-job-data', async (req, res) => {
  try {
    const data = await getseventeenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the seventeenth job
app.get('/api/get-countries-seventeenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the seventeenth job
app.get('/api/get-decade-seventeenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the quintile options for the seventeenth job
app.get('/api/get-quintile-seventeenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('fatalityByCountryDecadeAndQuintile');

    // Perform an aggregation query to retrieve the distinct decade options
    const quintileOptions = await dataByCountryAnddecadeCollection.distinct('quintile');

    res.json(quintileOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// eighteenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadeighteenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadeEighteenth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const percentage = data.percentage;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new percentage data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                percentage,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            percentage,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-eighteenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/eighteenthJobResult/part-r-00000.csv');

  uploadeighteenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the eighteenth job
async function geteighteenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadeEighteenth');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-eighteenth-job-data', async (req, res) => {
  try {
    const data = await geteighteenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the eighteenth job
app.get('/api/get-countries-eighteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadeEighteenth');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the eighteenth job
app.get('/api/get-decade-eighteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadeEighteenth');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// nineteenth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadnineteenthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadenineteenth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const total = data.total;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            total,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-nineteenth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/nineteenthJobResult/part-r-00000.csv');

  uploadnineteenthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the nineteenth job
async function getnineteenthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadenineteenth');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-nineteenth-job-data', async (req, res) => {
  try {
    const data = await getnineteenthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the nineteenth job
app.get('/api/get-countries-nineteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadenineteenth');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the nineteenth job
app.get('/api/get-decade-nineteenth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadenineteenth');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentieth job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadtwentiethJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentieth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const percentage = data.percentage;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new percentage data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                percentage,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            percentage,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-twentieth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentiethJobResult/part-r-00000.csv');

  uploadtwentiethJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentieth job
async function gettwentiethJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentieth');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-twentieth-job-data', async (req, res) => {
  try {
    const data = await gettwentiethJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the twentieth job
app.get('/api/get-countries-twentieth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentieth');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the twentieth job
app.get('/api/get-decade-twentieth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentieth');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentyFirst job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadtwentyFirstJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyFirst');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const total = data.total;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            total,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-twentyFirst-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentyFirstJobResult/part-r-00000.csv');

  uploadtwentyFirstJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentyFirst job
async function gettwentyFirstJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyFirst');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-twentyFirst-job-data', async (req, res) => {
  try {
    const data = await gettwentyFirstJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the twentyFirst job
app.get('/api/get-countries-twentyFirst-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyFirst');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the twentyFirst job
app.get('/api/get-decade-twentyFirst-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyFirst');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentySecond job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadtwentySecondJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentySecond');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const total = data.total;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            total,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-twentySecond-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentySecondJobResult/part-r-00000.csv');

  uploadtwentySecondJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentySecond job
async function gettwentySecondJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentySecond');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-twentySecond-job-data', async (req, res) => {
  try {
    const data = await gettwentySecondJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the twentySecond job
app.get('/api/get-countries-twentySecond-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentySecond');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the twentySecond job
app.get('/api/get-decade-twentySecond-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentySecond');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentyThird job
// Function to upload data by Country and decade CSV to MongoDB
async function uploadtwentyThirdJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyThird');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const country = data.Country;
        const decade = data.decade;
        const total = data.total;

        // Check if the document already exists in the collection for the given country and decade
        const existingDocument = await dataByCountryAnddecadeCollection.findOne({ country, decade });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByCountryAnddecadeCollection.updateOne(
            { country, decade },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the country and decade
          const newData = {
            country,
            decade,
            total,
          };
          await dataByCountryAnddecadeCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by Country and decade CSV data to MongoDB
app.post('/api/upload-twentyThird-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentyThirdJobResult/part-r-00000.csv');

  uploadtwentyThirdJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentyThird job
async function gettwentyThirdJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyThird');

    // Perform an aggregation query to group the data by country and decade
    const data = await dataByCountryAnddecadeCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by Country and decade from MongoDB
app.get('/api/get-twentyThird-job-data', async (req, res) => {
  try {
    const data = await gettwentyThirdJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the countries for the twentyThird job
app.get('/api/get-countries-twentyThird-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyThird');

    // Perform an aggregation query to retrieve the distinct countries
    const countries = await dataByCountryAnddecadeCollection.distinct('country');

    res.json(countries);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the decade options for the twentyThird job
app.get('/api/get-decade-twentyThird-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by Country and decade
    const dataByCountryAnddecadeCollection = db.collection('dataByCountryAnddecadetwentyThird');

    // Perform an aggregation query to retrieve the distinct decade options
    const decadeOptions = await dataByCountryAnddecadeCollection.distinct('decade');

    res.json(decadeOptions);
  } catch (error) {
    console.error('Error retrieving decade options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//twentyFourthJob
// Function to upload twentyFourth job CSV data to MongoDB
async function uploadtwentyFourthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for total homicide victims per country
    const totalHomicideCollection = db.collection('totalHomicideVictimsPerCountryTwentyFourth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const countryName = data.Country;
        const homicidetotal = parseFloat(data.HomicideTotal);

        // Check if the country already exists in the collection
        const existingCountry = await totalHomicideCollection.findOne({ country: countryName });

        if (existingCountry) {
          // Update the existing document with new homicide total
          await totalHomicideCollection.updateOne(
            { country: countryName },
            { $set: { total: homicidetotal } }
          );
        } else {
          // Create a new document for the country
          const homicide = {
            total: homicidetotal,
            country: countryName,
          };
          await totalHomicideCollection.insertOne(homicide);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload the twentyFourth job CSV data to MongoDB
app.post('/api/upload-twentyFourth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentyFourthJobResult/part-r-00000.csv');

  uploadtwentyFourthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB
async function gettwentyFourthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for total homicide victims per country
    const totalHomicideCollection = db.collection('totalHomicideVictimsPerCountryTwentyFourth');

    // Retrieve all documents from the collection
    const data = await totalHomicideCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the twentyFourth job data from MongoDB
app.get('/api/get-twentyFourth-job-data', async (req, res) => {
  try {
    const data = await gettwentyFourthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the country names for the twentyFourth job from MongoDB
app.get('/api/get-countries-twentyFourth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for total homicide victims per country
    const totalHomicideCollection = db.collection('totalHomicideVictimsPerCountryTwentyFourth');

    // Retrieve all documents from the collection
    const data = await totalHomicideCollection.find().toArray();

    // Transform the data to include only the country names
    const countryNames = data.map(entry => entry.country);

    res.json(countryNames);
  } catch (error) {
    console.error('Error retrieving countries from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentyFifth job
// Function to upload data by region and year CSV to MongoDB
async function uploadtwentyFifthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('dataByregionAndyeartwentyFifth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const region = data.region;
        const year = data.year;
        const total = data.total;

        // Check if the document already exists in the collection for the given region and year
        const existingDocument = await dataByregionAndyearCollection.findOne({ region, year });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByregionAndyearCollection.updateOne(
            { region, year },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the region and year
          const newData = {
            region,
            year,
            total,
          };
          await dataByregionAndyearCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by region and year CSV data to MongoDB
app.post('/api/upload-twentyFifth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentyFifthJobResult/part-r-00000.csv');

  uploadtwentyFifthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentyFifth job
async function gettwentyFifthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('dataByregionAndyeartwentyFifth');

    // Perform an aggregation query to group the data by region and year
    const data = await dataByregionAndyearCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by region and year from MongoDB
app.get('/api/get-twentyFifth-job-data', async (req, res) => {
  try {
    const data = await gettwentyFifthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the regions for the twentyFifth job
app.get('/api/get-regions-twentyFifth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('dataByregionAndyeartwentyFifth');

    // Perform an aggregation query to retrieve the distinct regions
    const regions = await dataByregionAndyearCollection.distinct('region');

    res.json(regions);
  } catch (error) {
    console.error('Error retrieving regions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the year options for the twentyFifth job
app.get('/api/get-year-twentyFifth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('dataByregionAndyeartwentyFifth');

    // Perform an aggregation query to retrieve the distinct year options
    const yearOptions = await dataByregionAndyearCollection.distinct('year');

    res.json(yearOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentySixth job
// Function to upload data by subregion and year CSV to MongoDB
async function uploadtwentySixthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('dataBysubregionAndyeartwentySixth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const subregion = data.subregion;
        const year = data.year;
        const total = data.total;

        // Check if the document already exists in the collection for the given subregion and year
        const existingDocument = await dataBysubregionAndyearCollection.findOne({ subregion, year });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataBysubregionAndyearCollection.updateOne(
            { subregion, year },
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the subregion and year
          const newData = {
            subregion,
            year,
            total,
          };
          await dataBysubregionAndyearCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by subregion and year CSV data to MongoDB
app.post('/api/upload-twentySixth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentySixthJobResult/part-r-00000.csv');

  uploadtwentySixthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentySixth job
async function gettwentySixthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('dataBysubregionAndyeartwentySixth');

    // Perform an aggregation query to group the data by subregion and year
    const data = await dataBysubregionAndyearCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by subregion and year from MongoDB
app.get('/api/get-twentySixth-job-data', async (req, res) => {
  try {
    const data = await gettwentySixthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the subregions for the twentySixth job
app.get('/api/get-subregions-twentySixth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('dataBysubregionAndyeartwentySixth');

    // Perform an aggregation query to retrieve the distinct subregions
    const subregions = await dataBysubregionAndyearCollection.distinct('subregion');

    res.json(subregions);
  } catch (error) {
    console.error('Error retrieving subregions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the year options for the twentySixth job
app.get('/api/get-year-twentySixth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('dataBysubregionAndyeartwentySixth');

    // Perform an aggregation query to retrieve the distinct year options
    const yearOptions = await dataBysubregionAndyearCollection.distinct('year');

    res.json(yearOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentySeventh job
// Function to upload data by region and year CSV to MongoDB
async function uploadtwentySeventhJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('totalByregionyearAndsexSeventh');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const region = data.region;
        const year = data.year;
        const sex = data.sex;
        const total = parseFloat(data.total);

        // Check if the document already exists in the collection for the given region and year
        const existingDocument = await dataByregionAndyearCollection.findOne({ region, year, sex });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataByregionAndyearCollection.updateOne(
            { region, year, sex},
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the region and year
          const newData = {
            region,
            year,
            sex,
            total,
          };
          await dataByregionAndyearCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by region and year CSV data to MongoDB
app.post('/api/upload-twentySeventh-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentySeventhJobResult/part-r-00000.csv');

  uploadtwentySeventhJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentySeventh job
async function gettwentySeventhJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('totalByregionyearAndsexSeventh');

    // Perform an aggregation query to group the data by region and year
    const data = await dataByregionAndyearCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by region and year from MongoDB
app.get('/api/get-twentySeventh-job-data', async (req, res) => {
  try {
    const data = await gettwentySeventhJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the regions for the twentySeventh job
app.get('/api/get-regions-twentySeventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('totalByregionyearAndsexSeventh');

    // Perform an aggregation query to retrieve the distinct regions
    const regions = await dataByregionAndyearCollection.distinct('region');

    res.json(regions);
  } catch (error) {
    console.error('Error retrieving regions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the year options for the twentySeventh job
app.get('/api/get-year-twentySeventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('totalByregionyearAndsexSeventh');

    // Perform an aggregation query to retrieve the distinct year options
    const yearOptions = await dataByregionAndyearCollection.distinct('year');

    res.json(yearOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the sex options for the twentySeventh job
app.get('/api/get-sex-twentySeventh-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by region and year
    const dataByregionAndyearCollection = db.collection('totalByregionyearAndsexSeventh');

    // Perform an aggregation query to retrieve the distinct year options
    const sexOptions = await dataByregionAndyearCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// twentyEighth job
// Function to upload data by subregion and year CSV to MongoDB
async function uploadtwentyEighthJobCSVToMongoDB(csvFilePath) {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('totalBysubregionyearAndsexEighth');

    const jsonArray = [];

    // Read the CSV file, parse its contents, and process each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const subregion = data.subregion;
        const year = data.year;
        const sex = data.sex;
        const total = parseFloat(data.total);

        // Check if the document already exists in the collection for the given subregion and year
        const existingDocument = await dataBysubregionAndyearCollection.findOne({ subregion, year, sex });

        if (existingDocument) {
          // Update the existing document with new total data
          await dataBysubregionAndyearCollection.updateOne(
            { subregion, year, sex},
            {
              $set: {
                total,
              },
            }
          );
        } else {
          // Create a new document for the subregion and year
          const newData = {
            subregion,
            year,
            sex,
            total,
          };
          await dataBysubregionAndyearCollection.insertOne(newData);
        }
      })
      .on('end', () => {
        console.log('CSV data has been uploaded to MongoDB successfully!');
      });
  } catch (error) {
    console.error('Error uploading CSV data to MongoDB:', error);
  }
}

// Endpoint to upload data by subregion and year CSV data to MongoDB
app.post('/api/upload-twentyEighth-job-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'jobsResults/twentyEighthJobResult/part-r-00000.csv');

  uploadtwentyEighthJobCSVToMongoDB(csvFilePath)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error('Error uploading CSV data:', error);
      res.sendStatus(500);
    });
});

// Function to retrieve data from MongoDB for the twentyEighth job
async function gettwentyEighthJobDataFromMongoDB() {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('totalBysubregionyearAndsexEighth');

    // Perform an aggregation query to group the data by subregion and year
    const data = await dataBysubregionAndyearCollection.find().toArray();

    return data;
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    throw error;
  }
}

// Endpoint to get the data by subregion and year from MongoDB
app.get('/api/get-twentyEighth-job-data', async (req, res) => {
  try {
    const data = await gettwentyEighthJobDataFromMongoDB();
    res.json(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the subregions for the twentyEighth job
app.get('/api/get-subregions-twentyEighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('totalBysubregionyearAndsexEighth');

    // Perform an aggregation query to retrieve the distinct subregions
    const subregions = await dataBysubregionAndyearCollection.distinct('subregion');

    res.json(subregions);
  } catch (error) {
    console.error('Error retrieving subregions from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the year options for the twentyEighth job
app.get('/api/get-year-twentyEighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('totalBysubregionyearAndsexEighth');

    // Perform an aggregation query to retrieve the distinct year options
    const yearOptions = await dataBysubregionAndyearCollection.distinct('year');

    res.json(yearOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get the sex options for the twentyEighth job
app.get('/api/get-sex-twentyEighth-job', async (req, res) => {
  try {
    // Connect to the MongoDB database
    const db = client.db('project2');

    // Get the collection for data by subregion and year
    const dataBysubregionAndyearCollection = db.collection('totalBysubregionyearAndsexEighth');

    // Perform an aggregation query to retrieve the distinct year options
    const sexOptions = await dataBysubregionAndyearCollection.distinct('sex');

    res.json(sexOptions);
  } catch (error) {
    console.error('Error retrieving year options from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the first job HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/firstJob.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});