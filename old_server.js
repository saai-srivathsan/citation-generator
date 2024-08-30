const express = require('express');
const path = require('path');
const fs = require('fs');
const CSL = require('citeproc'); 
const cors = require('cors');
const axios = require('axios');

const staticDirectory = path.join(process.cwd(), 'styles');
const app = express();

app.use(cors());
app.use('/styles', express.static(staticDirectory)); // Serve static files from 'styles' directory

// Endpoint to return the list of CSL files
app.get('/styles', (req, res) => {
    fs.readdir(staticDirectory, (err, files) => {
        if (err) {
            console.error('Error reading styles directory:', err);
            return res.status(500).send('Error reading styles directory');
        }
        res.json(files.filter(file => file.endsWith('.csl'))); // Return only .csl files
    });
});

// Endpoint to generate citation
app.get('/generate-citation', async (req, res) => {
    // console.log("hi");
    const { doi, style } = req.query;
    // console.log(`https://api.crossref.org/works/${doi}`);
    if (!doi || !style) {
        return res.status(400).json({ error: 'DOI and style are required.' });
    }

    try {
        // Fetch CrossRef data for the given DOI
        const response = await axios.get(`https://api.crossref.org/works/${doi}`);
        // console.log(response.data);
        
        if (!response.data) {
            console.error(`Error fetching CrossRef data: ${response.statusText}`);
            return res.status(500).json({ error: 'Failed to fetch data from CrossRef.' });
        }
        
        const crossRefData = response.data;

        // Transform data to Citeproc format
        const citeprocData = transformCrossRefToCiteproc(crossRefData);

        // Load the selected CSL style file
        const cslFilePath = path.join(staticDirectory, style);
        const localeFilePath = path.join(staticDirectory, 'locales-en-US.xml');
        
        if (!fs.existsSync(cslFilePath)) {
            console.error(`CSL style file not found: ${style}`);
            return res.status(404).json({ error: 'CSL style file not found.' });
        }
        
        const cslStyle = await fs.promises.readFile(cslFilePath, 'utf8');
        const locale = await fs.promises.readFile(localeFilePath, 'utf8');

        // Create CSL engine and generate citation
        const sys = {
            retrieveLocale: () => locale,
            retrieveItem: () => citeprocData
        };
        const citeproc = new CSL.Engine(sys, cslStyle);
        citeproc.updateItems([citeprocData.id]);

        const citation = citeproc.makeCitationCluster([{ id: citeprocData.id }]);
        const bibliography = citeproc.makeBibliography();
        // console.log(bibliography);
        // Send the formatted citation and bibliography as a response
        res.json({
            citation: citation,
            bibliography: bibliography[1].join('\n')
        });

    } catch (error) {
        console.error('Error generating citation:', error);
        res.status(500).json({ error: 'Error generating citation.' });
    }
});

// Function to transform CrossRef data to Citeproc format
function transformCrossRefToCiteproc(crossRefData) {
    const message = crossRefData.message;
    return {
        id: message.DOI,
        type: message.type,
        title: message.title[0],
        author: message.author.map(author => ({
            family: author.family,
            given: author.given
        })),
        issued: {
            'date-parts': message.published['date-parts']
        },
        publisher: message.publisher
    };
}

app.listen(7777, () => {
    console.log('Server running on http://127.0.0.1:7777');
});
