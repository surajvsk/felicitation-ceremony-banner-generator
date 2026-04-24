const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const csv = require('csv-parser');
const { generateBanners } = require('./generator');

const app = express();
const PORT = 3000;

// Setup directories
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/generate', upload.fields([
    { name: 'photos', maxCount: 100 },
    { name: 'csvFile', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), async (req, res) => {
    try {
        const { schoolName, title, subtitle, managerDetails, theme, size, watermark } = req.body;
        
        const photos = req.files['photos'] || [];
        const csvFile = req.files['csvFile'] ? req.files['csvFile'][0] : null;
        const logo = req.files['logo'] ? req.files['logo'][0] : null;

        if (photos.length === 0) {
            return res.status(400).send('Please upload at least one photo.');
        }

        // Parse CSV if provided
        let csvData = null;
        if (csvFile) {
            csvData = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(csvFile.path)
                    .pipe(csv())
                    .on('data', (data) => csvData.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        }

        // Clean output directory
        const oldFiles = fs.readdirSync(outputDir);
        for (const file of oldFiles) fs.unlinkSync(path.join(outputDir, file));

        // Generate Banners
        const generatedFiles = await generateBanners({
            photos,
            csvData,
            logoPath: logo ? logo.path : null,
            schoolName,
            title,
            subtitle,
            managerDetails,
            theme,
            size,
            watermark,
            outputDir
        });

        // Create Zip
        const zipPath = path.join(__dirname, 'banners.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function() {
            res.download(zipPath, 'Felicitation_Banners.zip', () => {
                // Cleanup after download
                if(fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                for(const file of generatedFiles) {
                    if(fs.existsSync(file.path)) fs.unlinkSync(file.path);
                }
                for(const file of photos) fs.unlinkSync(file.path);
                if(csvFile) fs.unlinkSync(csvFile.path);
                if(logo) fs.unlinkSync(logo.path);
            });
        });

        archive.pipe(output);
        for (const file of generatedFiles) {
            archive.file(file.path, { name: file.name });
        }
        await archive.finalize();

    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred during banner generation.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
