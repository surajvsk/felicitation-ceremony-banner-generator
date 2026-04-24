const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateBanners({
    photos, 
    csvData, 
    logoPath,
    schoolName,
    title,
    subtitle,
    managerDetails,
    theme,
    size,
    watermark,
    outputDir
}) {
    // Determine canvas size
    let width, height, chunkSize;
    let positions = [];
    
    if (size === 'instagram') {
        width = 1080; height = 1080; chunkSize = 1;
        positions = [{ x: 540, y: 650, angle: 0 }];
    } else if (size === 'story') {
        width = 1080; height = 1920; chunkSize = 2;
        positions = [{ x: 540, y: 800, angle: -2 }, { x: 540, y: 1500, angle: 2 }];
    } else {
        // Default Flex Banner 4K
        width = 3840; height = 2160; chunkSize = 3;
        positions = [{ x: 750, y: 1250, angle: -3 }, { x: 1920, y: 1250, angle: 2 }, { x: 3090, y: 1250, angle: -2 }];
    }

    const generatedFiles = [];

    for (let b = 0; b < Math.ceil(photos.length / chunkSize); b++) {
        const files = photos.slice(b * chunkSize, (b + 1) * chunkSize);
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Draw Theme Background
        if (theme === 'republic') {
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#ff9933'); // Saffron
            grad.addColorStop(0.5, '#ffffff'); // White
            grad.addColorStop(1, '#138808'); // Green
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        } else if (theme === 'modern') {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            for(let i=0; i<width; i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
            for(let i=0; i<height; i+=40){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }
        } else {
            // Default Royal
            const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
            bgGradient.addColorStop(0, '#ffffff'); 
            bgGradient.addColorStop(0.4, '#f0f4f8'); 
            bgGradient.addColorStop(1, '#d0e1e8'); 
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.moveTo(0, height * 0.3);
            ctx.bezierCurveTo(width * 0.3, height * 0.1, width * 0.7, height * 0.5, width, height * 0.3);
            ctx.lineTo(width, 0); ctx.lineTo(0, 0);
            ctx.fillStyle = '#d4af37'; ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, height * 0.7);
            ctx.bezierCurveTo(width * 0.4, height * 0.9, width * 0.6, height * 0.5, width, height * 0.7);
            ctx.lineTo(width, height); ctx.lineTo(0, height);
            ctx.fillStyle = '#183b8a'; ctx.fill();
            ctx.restore();

            ctx.fillStyle = '#0f2453'; 
            ctx.fillRect(0, 0, width, size === 'banner' ? 100 : 50);
            ctx.fillRect(0, height - (size === 'banner' ? 140 : 80), width, size === 'banner' ? 140 : 80);

            ctx.fillStyle = '#d4af37';
            ctx.fillRect(0, size === 'banner' ? 100 : 50, width, 10);
            ctx.fillRect(0, height - (size === 'banner' ? 150 : 90), width, 10);
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
        ctx.fillText(schoolName || '', width / 2, 200 * scaleText, width - 200);

        const textGrad = ctx.createLinearGradient(0, 300 * scaleText, 0, 450 * scaleText);
        textGrad.addColorStop(0, '#bf953f');
        textGrad.addColorStop(0.5, '#fcf6ba');
        textGrad.addColorStop(1, '#b38728');
        
        ctx.fillStyle = theme === 'modern' ? '#e0e0e0' : textGrad; 
        ctx.font = `bold ${160 * scaleText}px serif`;
        ctx.fillText(title || '', width / 2, 310 * scaleText, width - 200);

        ctx.fillStyle = theme === 'modern' ? '#aaaaaa' : '#333333'; 
        ctx.font = `bold ${70 * scaleText}px sans-serif`;
        ctx.fillText(subtitle || '', width / 2, 490 * scaleText, width - 200);

        ctx.fillStyle = theme === 'modern' ? '#ffffff' : (theme === 'republic' ? '#000000' : '#ffffff'); 
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${60 * scaleText}px sans-serif`;
        ctx.fillText(managerDetails || '', width / 2, height - (70 * scaleText), width - 200);

        // Photos
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pos = positions[i];
            if(!pos) continue;

            const imgPath = file.path; // Multer file object
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

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 15;
            ctx.shadowOffsetY = 25;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-drawW / 2 - framePadding, -drawH / 2 - framePadding, 
                         drawW + 2 * framePadding, drawH + framePadding + bottomPadding);

            ctx.shadowColor = 'transparent';

            ctx.filter = 'brightness(1.6) contrast(1.15)';
            ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
            
            // Draw student info if found
            if (studentData) {
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.font = `bold ${size === 'banner' ? 45 : 25}px sans-serif`;
                ctx.fillText(studentData.name || '', 0, drawH / 2 + (size === 'banner' ? 30 : 15));
                ctx.fillStyle = '#d32f2f';
                ctx.fillText(studentData.marks ? `Marks: ${studentData.marks}` : '', 0, drawH / 2 + (size === 'banner' ? 85 : 45));
            }

            ctx.restore();
        }

        // Watermark
        if (watermark === 'true' || watermark === true) {
            ctx.save();
            ctx.translate(width/2, height/2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${400 * scaleText}px sans-serif`;
            ctx.fillText('SAMPLE COPY', 0, 0);
            ctx.restore();
        }

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
    
    return generatedFiles;
}

module.exports = { generateBanners };
