const { createCanvas, loadImage, registerFont, GlobalFonts } = require('canvas');
const fs = require('fs');
const path = require('path');
const GIFEncoder = require('gif-encoder-2');

async function generateBanners({
    photos, 
    csvData, 
    logoPath,
    fontPath,
    schoolName,
    title,
    subtitle,
    managerDetails,
    theme,
    size,
    watermark,
    exportFormat,
    outputDir
}) {
    // Register custom font if provided
    let titleFontFamily = 'serif';
    if (fontPath && fs.existsSync(fontPath)) {
        titleFontFamily = 'CustomCalligraphyFont';
        if (GlobalFonts && GlobalFonts.registerFromPath) {
            GlobalFonts.registerFromPath(fontPath, titleFontFamily);
        } else if (typeof registerFont === 'function') {
            registerFont(fontPath, { family: titleFontFamily });
        }
    }

    // Determine canvas size
    let baseWidth, baseHeight, chunkSize;
    let positions = [];
    
    if (size === 'instagram') {
        baseWidth = 1080; baseHeight = 1080; chunkSize = 1;
        positions = [{ x: 540, y: 650, angle: 0 }];
    } else if (size === 'story') {
        baseWidth = 1080; baseHeight = 1920; chunkSize = 2;
        positions = [{ x: 540, y: 800, angle: -2 }, { x: 540, y: 1500, angle: 2 }];
    } else {
        // Default Flex Banner 4K
        baseWidth = 3840; baseHeight = 2160; chunkSize = 3;
        positions = [{ x: 750, y: 1250, angle: -3 }, { x: 1920, y: 1250, angle: 2 }, { x: 3090, y: 1250, angle: -2 }];
    }

    const generatedFiles = [];
    const totalPages = Math.ceil(photos.length / chunkSize);

    // Setup Export Specific Streams
    let pdfCanvas, pdfCtx, pdfOut, pdfStream;
    let gifEncoder, gifOut;
    let scaleRatio = 1;

    if (exportFormat === 'pdf') {
        pdfCanvas = createCanvas(baseWidth, baseHeight, 'pdf');
        pdfCtx = pdfCanvas.getContext('2d');
        const outName = 'Felicitation_Banners.pdf';
        const outPath = path.join(outputDir, outName);
        generatedFiles.push({ path: outPath, name: outName });
    } else if (exportFormat === 'gif') {
        // For GIF, restrict max width to 1080 to prevent massive memory usage
        let drawWidth = baseWidth;
        let drawHeight = baseHeight;
        if (baseWidth > 1080) {
            scaleRatio = 1080 / baseWidth;
            drawWidth = 1080;
            drawHeight = Math.floor(baseHeight * scaleRatio);
        }

        gifEncoder = new GIFEncoder(drawWidth, drawHeight);
        const outName = 'Slideshow.gif';
        const outPath = path.join(outputDir, outName);
        gifOut = fs.createWriteStream(outPath);
        
        gifEncoder.createReadStream().pipe(gifOut);
        gifEncoder.start();
        gifEncoder.setRepeat(0); // Infinite loop
        gifEncoder.setDelay(2500); // 2.5 seconds per slide
        gifEncoder.setQuality(10);
        generatedFiles.push({ path: outPath, name: outName });
    }

    for (let b = 0; b < totalPages; b++) {
        const files = photos.slice(b * chunkSize, (b + 1) * chunkSize);
        
        let canvas, ctx;
        if (exportFormat === 'pdf') {
            canvas = pdfCanvas;
            ctx = pdfCtx;
        } else {
            let drawWidth = baseWidth;
            let drawHeight = baseHeight;
            if (exportFormat === 'gif') {
                drawWidth = Math.floor(baseWidth * scaleRatio);
                drawHeight = Math.floor(baseHeight * scaleRatio);
            }
            canvas = createCanvas(drawWidth, drawHeight);
            ctx = canvas.getContext('2d');
        }

        ctx.save();
        if (exportFormat === 'gif') {
            ctx.scale(scaleRatio, scaleRatio);
        }

        // Draw Theme Background
        if (theme === 'republic') {
            const grad = ctx.createLinearGradient(0, 0, 0, baseHeight);
            grad.addColorStop(0, '#ff9933'); // Saffron
            grad.addColorStop(0.5, '#ffffff'); // White
            grad.addColorStop(1, '#138808'); // Green
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, baseWidth, baseHeight);
        } else if (theme === 'modern') {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, baseWidth, baseHeight);
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for(let i=0; i<baseWidth; i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,baseHeight); ctx.stroke(); }
            for(let i=0; i<baseHeight; i+=40){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(baseWidth,i); ctx.stroke(); }
        } else {
            // Default Royal
            const bgGradient = ctx.createRadialGradient(baseWidth/2, baseHeight/2, 0, baseWidth/2, baseHeight/2, baseWidth);
            bgGradient.addColorStop(0, '#ffffff'); 
            bgGradient.addColorStop(0.4, '#f0f4f8'); 
            bgGradient.addColorStop(1, '#d0e1e8'); 
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, baseWidth, baseHeight);

            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.moveTo(0, baseHeight * 0.3);
            ctx.bezierCurveTo(baseWidth * 0.3, baseHeight * 0.1, baseWidth * 0.7, baseHeight * 0.5, baseWidth, baseHeight * 0.3);
            ctx.lineTo(baseWidth, 0); ctx.lineTo(0, 0);
            ctx.fillStyle = '#d4af37'; ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, baseHeight * 0.7);
            ctx.bezierCurveTo(baseWidth * 0.4, baseHeight * 0.9, baseWidth * 0.6, baseHeight * 0.5, baseWidth, baseHeight * 0.7);
            ctx.lineTo(baseWidth, baseHeight); ctx.lineTo(0, baseHeight);
            ctx.fillStyle = '#183b8a'; ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#0f2453'; 
            ctx.fillRect(0, 0, baseWidth, size === 'banner' ? 100 : 50);
            ctx.fillRect(0, baseHeight - (size === 'banner' ? 140 : 80), baseWidth, size === 'banner' ? 140 : 80);

            ctx.fillStyle = '#d4af37';
            ctx.fillRect(0, size === 'banner' ? 100 : 50, baseWidth, 10);
            ctx.fillRect(0, baseHeight - (size === 'banner' ? 150 : 90), baseWidth, 10);
        }

        // Add Logo
        if (logoPath && fs.existsSync(logoPath)) {
            try {
                const logo = await loadImage(logoPath);
                const logoSize = size === 'banner' ? 250 : 120;
                ctx.drawImage(logo, 50, 50, logoSize, logoSize * (logo.height/logo.width));
            } catch(e){}
        }

        // Dynamic Text Sizes based on layout
        const scaleText = size === 'banner' ? 1 : (size === 'instagram' ? 0.3 : 0.4);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        ctx.fillStyle = theme === 'modern' ? '#ffffff' : '#7a1b1b'; 
        ctx.font = `bold ${80 * scaleText}px sans-serif`; 
        ctx.fillText(schoolName || '', baseWidth / 2, 200 * scaleText, baseWidth - 200);

        const textGrad = ctx.createLinearGradient(0, 300 * scaleText, 0, 450 * scaleText);
        textGrad.addColorStop(0, '#bf953f');
        textGrad.addColorStop(0.5, '#fcf6ba');
        textGrad.addColorStop(1, '#b38728');
        
        ctx.fillStyle = theme === 'modern' ? '#e0e0e0' : textGrad; 
        ctx.font = `bold ${160 * scaleText}px "${titleFontFamily}"`;
        ctx.fillText(title || '', baseWidth / 2, 310 * scaleText, baseWidth - 200);

        ctx.fillStyle = theme === 'modern' ? '#aaaaaa' : '#333333'; 
        ctx.font = `bold ${70 * scaleText}px sans-serif`;
        ctx.fillText(subtitle || '', baseWidth / 2, 490 * scaleText, baseWidth - 200);

        ctx.fillStyle = theme === 'modern' ? '#ffffff' : (theme === 'republic' ? '#000000' : '#ffffff'); 
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${60 * scaleText}px sans-serif`;
        ctx.fillText(managerDetails || '', baseWidth / 2, baseHeight - (70 * scaleText), baseWidth - 200);

        // Photos
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pos = positions[i];
            if(!pos) continue;

            const imgPath = file.path; 
            let image;
            try { image = await loadImage(imgPath); } catch (e) { continue; }

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.angle * Math.PI / 180);

            let maxBoxSize = size === 'banner' ? 950 : (size === 'instagram' ? 500 : 700);
            let framePadding = size === 'banner' ? 45 : 20;
            let bottomPadding = size === 'banner' ? 75 : 40; 
            
            // CSV Data mapping
            let studentData = null;
            if (csvData) {
                studentData = csvData.find(d => file.originalname.includes(d.filename) || (d.filename && d.filename.includes(file.originalname)));
            }
            if (studentData) {
                bottomPadding += size === 'banner' ? 100 : 60; // Make space for text
            }

            const scale = Math.min(maxBoxSize / image.width, maxBoxSize / image.height);
            const drawW = image.width * scale;
            const drawH = image.height * scale;

            if (exportFormat !== 'pdf') {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 35;
                ctx.shadowOffsetX = 15;
                ctx.shadowOffsetY = 25;
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-drawW / 2 - framePadding, -drawH / 2 - framePadding, 
                         drawW + 2 * framePadding, drawH + framePadding + bottomPadding);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Use off-screen canvas to apply filters (fixes missing images in PDF/GIF exports)
            const tempCanvas = createCanvas(Math.ceil(drawW), Math.ceil(drawH));
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.filter = 'brightness(1.6) contrast(1.15)';
            tempCtx.drawImage(image, 0, 0, drawW, drawH);

            ctx.drawImage(tempCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
            
            // Draw student info if found
            if (studentData) {
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.font = `bold ${size === 'banner' ? 45 : 25}px sans-serif`;
                ctx.fillText(studentData.name || '', 0, drawH / 2 + (size === 'banner' ? 30 : 15), drawW);
                ctx.fillStyle = '#d32f2f';
                ctx.fillText(studentData.marks ? `Marks: ${studentData.marks}` : '', 0, drawH / 2 + (size === 'banner' ? 85 : 45), drawW);
            }

            ctx.restore();
        }

        // Watermark
        if (watermark === 'true' || watermark === true) {
            ctx.save();
            ctx.translate(baseWidth/2, baseHeight/2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${400 * scaleText}px sans-serif`;
            ctx.fillText('SAMPLE COPY', 0, 0);
            ctx.restore();
        }

        ctx.restore(); // Restore global scale for GIF

        if (exportFormat === 'pdf') {
            if (b < totalPages - 1) {
                pdfCtx.addPage();
            }
        } else if (exportFormat === 'gif') {
            gifEncoder.addFrame(ctx);
        } else {
            // JPG
            const outName = `banner_${size}_${b + 1}.jpg`;
            const outPath = path.join(outputDir, outName);
            const out = fs.createWriteStream(outPath);
            const stream = canvas.createJPEGStream({ quality: 0.95, chromaSubsampling: false });
            
            stream.pipe(out);
            await new Promise((resolve, reject) => {
                out.on('finish', resolve);
                out.on('error', reject);
            });
            generatedFiles.push({ path: outPath, name: outName });
        }
    }

    if (exportFormat === 'pdf') {
        const buffer = pdfCanvas.toBuffer('application/pdf');
        fs.writeFileSync(generatedFiles[0].path, buffer);
    } else if (exportFormat === 'gif') {
        gifEncoder.finish();
        await new Promise((resolve) => gifOut.on('close', resolve));
    }
    
    return generatedFiles;
}

module.exports = { generateBanners };
