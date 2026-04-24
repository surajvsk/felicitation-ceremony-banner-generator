const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createBanners() {
    const photoDir = path.join(__dirname, 'photos');
    const allFiles = fs.readdirSync(photoDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

    const chunkSize = 3;
    const width = 3840; 
    const height = 2160; 

    for (let b = 0; b < Math.ceil(allFiles.length / chunkSize); b++) {
        const files = allFiles.slice(b * chunkSize, (b + 1) * chunkSize);
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Premium Radial Background
        const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        bgGradient.addColorStop(0, '#ffffff'); // Center bright white/cream
        bgGradient.addColorStop(0.4, '#f0f4f8'); // Soft blue-ish white
        bgGradient.addColorStop(1, '#d0e1e8'); // Deeper cyan-blue edges
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Abstract golden waves in background
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.3);
        ctx.bezierCurveTo(width * 0.3, height * 0.1, width * 0.7, height * 0.5, width, height * 0.3);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.fillStyle = '#d4af37';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.bezierCurveTo(width * 0.4, height * 0.9, width * 0.6, height * 0.5, width, height * 0.7);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fillStyle = '#183b8a';
        ctx.fill();
        ctx.restore();

        // 2. Elegant Borders
        // Top deep blue ribbon
        ctx.fillStyle = '#0f2453'; 
        ctx.fillRect(0, 0, width, 100);
        
        // Bottom deep blue ribbon
        ctx.fillStyle = '#0f2453'; 
        ctx.fillRect(0, height - 140, width, 140);

        // Thin golden line right below/above the ribbons
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(0, 100, width, 10);
        ctx.fillRect(0, height - 150, width, 10);

        // Frame border
        ctx.strokeStyle = '#d4af37'; 
        ctx.lineWidth = 15;
        ctx.strokeRect(60, 150, width - 120, height - 340);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 5;
        ctx.strokeRect(75, 165, width - 150, height - 370);

        // 3. Text Section
        // School Name with Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#7a1b1b'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 80px sans-serif'; 
        ctx.fillText('डा, राजेन्द्र प्रसाद यादव इण्टर कालेज बारीगांव नेवादा मड़ियाहूं जौनपुर', width / 2, 200, width - 200);
        ctx.restore();

        // Ceremony Title (Golden Gradient Text)
        const textGrad = ctx.createLinearGradient(0, 300, 0, 450);
        textGrad.addColorStop(0, '#bf953f');
        textGrad.addColorStop(0.5, '#fcf6ba');
        textGrad.addColorStop(1, '#b38728');
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = textGrad; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 160px serif';
        ctx.fillText('FELICITATION CEREMONY', width / 2, 310, width - 200);
        ctx.restore();

        // Honoring achievers subtitle
        ctx.fillStyle = '#333333'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 70px sans-serif';
        // Simple letter spacing simulation
        ctx.fillText('H O N O R I N G   O U R   A C H I E V E R S', width / 2, 490, width - 200);

        // Star / Diamond decorative separator
        ctx.save();
        ctx.translate(width/2, 600);
        ctx.fillStyle = '#d4af37';
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(15, 0); ctx.lineTo(0, 20); ctx.lineTo(-15, 0); ctx.fill();
        ctx.fillRect(-600, -3, 560, 6);
        ctx.fillRect(40, -3, 560, 6);
        ctx.restore();

        // Bottom Manager Details
        ctx.fillStyle = '#ffffff'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 60px sans-serif';
        ctx.fillText('प्रबन्धक / संचालक - श्री परमानन्द यादव 6393021858', width / 2, height - 70, width - 200);

        // 4. Layout Photos (3 photos in a row)
        const positions = [
            { x: 750, y: 1250, angle: -3 },
            { x: 1920, y: 1250, angle: 2 },
            { x: 3090, y: 1250, angle: -2 }
        ];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pos = positions[i];
            if(!pos) continue;

            const imgPath = path.join(photoDir, file);
            let image;
            try {
                image = await loadImage(imgPath);
            } catch (e) {
                console.error("Could not load image: " + imgPath);
                continue;
            }

            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(pos.angle * Math.PI / 180);

            const maxBoxSize = 950; 
            const framePadding = 45;
            const bottomPadding = 75; 

            const scale = Math.min(maxBoxSize / image.width, maxBoxSize / image.height);
            const drawW = image.width * scale;
            const drawH = image.height * scale;

            // Rich Shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 15;
            ctx.shadowOffsetY = 25;

            // Draw Polaroid Base
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-drawW / 2 - framePadding, -drawH / 2 - framePadding, 
                         drawW + 2 * framePadding, drawH + framePadding + bottomPadding);

            ctx.shadowColor = 'transparent';

            // Draw a subtle inner frame border
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 2;
            ctx.strokeRect(-drawW / 2 - framePadding + 10, -drawH / 2 - framePadding + 10, 
                           drawW + 2 * framePadding - 20, drawH + framePadding + bottomPadding - 20);

            // Brightness and contrast
            ctx.filter = 'brightness(1.6) contrast(1.15)';
            ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            // Inner gold border right over the image
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 6;
            ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);

            // Tape effect at the top of the photo
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = 2;
            ctx.translate(0, -drawH / 2 - framePadding + 5);
            ctx.rotate(-0.05);
            ctx.fillRect(-100, -25, 200, 50);
            ctx.restore();

            ctx.restore();
        }

        const outPath = path.join(__dirname, `banner_part_${b + 1}.jpg`);
        const out = fs.createWriteStream(outPath);
        const stream = canvas.createJPEGStream({ quality: 0.95, chromaSubsampling: false });
        
        stream.pipe(out);
        await new Promise((resolve, reject) => {
            out.on('finish', resolve);
            out.on('error', reject);
        });
        console.log(`✅ Banner ${b + 1} created successfully: ${outPath}`);
    }
}

createBanners().catch(console.error);
