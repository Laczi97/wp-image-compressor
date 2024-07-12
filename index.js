const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

let count= 0;

async function start() {
    console.time("Execution Time"); // Start the timer
    //await downloadImages(urlList);
    await compressImages();
    console.timeEnd("Execution Time"); // End the timer and log the elapsed time
}

const urlList = new Set([
    /*'https://magyarmezogazdasag.hu/app/uploads/2023/11/48FA9304-F681-4A62-9A1F-F615F83FD06F.png',
    'https://magyarmezogazdasag.hu/app/uploads/2023/11/Longhorned_tick_Haemaphysalis_longicornis.png',
    'https://magyarmezogazdasag.hu/app/uploads/sites/3/2023/09/IMG_0919.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/09/0001.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2024/01/koreai_parlament.png',
    'https://magyarmezogazdasag.hu/app/uploads/sites/3/2023/09/DSCN4980.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/sites/3/2023/09/P1022954.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/sites/3/2023/09/36.-Babolnai-Gazdanapok03.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/12/P1025815_2.png',
    'https://magyarmezogazdasag.hu/app/uploads/2021/08//csabika_orias_cochi_opt.jpeg',
    'https://magyarmezogazdasag.hu/app/uploads/2022/05//megnyito_029-1024x683.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/04/hajduszoboszlo_061.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/sites/3/2023/07/krt12m_0_0.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/07/krt12m_0_0.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2021/06//img_20210531_115401.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2021/09/dr1_0-1024x696.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2019/01/2_3.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/05//vtf_0025.jpg',
    'https://magyarmezogazdasag.hu/app/uploads/2023/09/Corteva_Agriscience_Portfolio_Farm_03.jpg',*/
    'https://magyarmezogazdasag.hu/app/uploads/2019/01/piros-barack_0.png',
]);

async function downloadImages (urls) {
    const baseDir = process.cwd() + '/images';
    const baseDownloadUrl = 'https://magyarmezogazdasag.hu/app/uploads/';

    for (let url of urls) {
        console.log(url)
        const urlPath = new URL(url).pathname;
        const relativePath = urlPath.replace(baseDownloadUrl, '');
        const fullPath = path.join(baseDir, relativePath);
        const dirPath = path.dirname(fullPath);

        try {
            if (!fs.existsSync(baseDir)) {
                console.log('Creating directory:', baseDir)
                fs.mkdirSync(baseDir, { recursive: true });
            }
            if (!fs.existsSync(dirPath)) {
                console.log('Creating directory:', dirPath)
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (error) {
            console.error('Error creating directories:', error);
        }

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(fullPath, response.data);
    }
}

async function compressImages() {
    const baseDir = process.cwd() + '/images';
    const outputDir = process.cwd() + '/compressedImages';
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];

    await compressDirectory(baseDir, outputDir, imageExtensions);
    console.log("Done!");
    console.log(count);
    //await compressDirectoryFlat(baseDir, outputDir, imageExtensions);
}

async function compressDirectory(baseDir, outputDir, imageExtensions) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(baseDir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        const outputPath = path.join(outputDir, relativePath);

        if (entry.isDirectory()) {
            await compressDirectory(fullPath, outputPath, imageExtensions);
        } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name))) {
            const dirPath = path.dirname(outputPath);

            try {
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
            } catch (error) {
                console.error('Error creating directories:', error);
            }

            // Check if the file already exists in the outputPath
            if (fs.existsSync(outputPath)) {
                console.log(`File ${outputPath} already exists. Skipping...`);
                count++;
                continue;
            }

            // Check if the file size is 0
            const stats = fs.statSync(fullPath);
            if (stats.size === 0) {
                console.log(`File ${fullPath} is empty. Skipping...`);
                continue;
            }


            // Get the metadata of the image before compression
            if (path.extname(entry.name) === '.jpg' || path.extname(entry.name) === '.jpeg' || path.extname(entry.name) === '.png') {
                const metadata = await sharp(fullPath).metadata();

                // Save the width and height of the image in an object
                let imageData = {
                    width: metadata.width,
                    height: metadata.height,
                    extension: path.extname(entry.name)
                };

                // Calculate the aspect ratio
                const aspectRatio = imageData.width / imageData.height;

                // Adjust the width and height while maintaining the aspect ratio
                /*if (imageData.width > 1024) {
                    imageData.width = 1024;
                    imageData.height = Math.round(imageData.width / aspectRatio);
                }
                if (imageData.height > 1024) {
                    imageData.height = 1024;
                    imageData.width = Math.round(imageData.height * aspectRatio);
                }*/

                try {
                    if (imageData.extension=== '.jpg' || imageData.extension === '.jpeg') {
                        await sharp(fullPath)
                            /*.resize(imageData.width, imageData.height, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })*/
                            .withMetadata()
                            .jpeg({ quality: 70, progressive: true})
                            .toFile(outputPath);
                    }

                    if (imageData.extension === '.png') {
                        await sharp(fullPath)
                            /*.resize(imageData.width, imageData.height, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })*/
                            .withMetadata()
                            .png({ quality: 70, compressionLevel: 9, adaptiveFiltering: true, force: true})
                            .toFile(outputPath);
                    }
                } catch (error) {
                    console.error('Error in file: ', entry.name);
                    console.error('Error description: ', error);
                    continue;
                }

            }

            count++;

            if (count % 50 === 0) {
                console.log(count);
            }

        }
    }
}

async function compressDirectoryFlat(baseDir, outputDir, imageExtensions) {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(baseDir, entry.name);

        if (entry.isDirectory()) {
            await compressDirectoryFlat(fullPath, outputDir, imageExtensions);
        } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name))) {
            const outputPath = path.join(outputDir, entry.name);
            const dirPath = path.dirname(outputPath);

            try {
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
            } catch (error) {
                console.error('Error creating directories:', error);
            }

            // Get the metadata of the image before compression
            const metadata = await sharp(fullPath).metadata();

            // Save the width and height of the image in an object
            let imageData = {
                width: metadata.width,
                height: metadata.height,
                extension: path.extname(entry.name)
            };

            // Calculate the aspect ratio
            const aspectRatio = imageData.width / imageData.height;

            // Adjust the width and height while maintaining the aspect ratio
            /*if (imageData.width > 1000) {
                imageData.width = 1000;
                imageData.height = Math.round(imageData.width / aspectRatio);
            }
            if (imageData.height > 1000) {
                imageData.height = 1000;
                imageData.width = Math.round(imageData.height * aspectRatio);
            }*/

            if (imageData.extension === '.jpg' || imageData.extension === '.jpeg') {
                await sharp(fullPath)
                    .resize(imageData.width, imageData.height, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    //.withMetadata()
                    .jpeg({ quality: 70, progressive: true})
                    .toFile(outputPath);
            }

            if (imageData.extension === '.png') {
                await sharp(fullPath)
                    .resize(imageData.width, imageData.height, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    //.withMetadata()
                    .png({ quality: 70, compressionLevel: 9, adaptiveFiltering: true, force: true})
                    .toFile(outputPath);
            }
        }
    }
}

start()
    .then(() => {
        console.log("Done");
        process.exit(0);
    })
    .catch((error) => {
        console.log("Error:", error);
        (async () => {
            process.exit(1);
        })();
    });