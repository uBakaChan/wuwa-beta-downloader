import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BasicResponse, ResourceResponse } from './interfaces';
import ProgressBar from 'progress'

async function downloadResources(url: string, md5: string, outputPath: string) {
    const fullOutputPath = path.join(__dirname, "Wuthering Waves Game", outputPath);
    // Check if the file exists
    if (fs.existsSync(fullOutputPath)) {
        // If an MD5 is provided, compute and check it
        if (md5) {
            // Compute the MD5 hash of the existing file
            const fileHash = crypto.createHash('md5');
            const fileStream = fs.createReadStream(fullOutputPath);

            await new Promise<void>((resolve, reject) => {
                fileStream.on('data', chunk => fileHash.update(chunk));
                fileStream.on('end', resolve);
                fileStream.on('error', reject);
            });

            const existingMd5 = fileHash.digest('hex');

            // Check if the existing file's MD5 matches the provided MD5
            if (existingMd5 === md5) {
                console.log('File already exists and MD5 matches:', fullOutputPath);
                return; // Exit the function early as no download is needed
            } else {
                console.log('File exists but MD5 does not match. Re-downloading:', fullOutputPath);
            }
        } else {
            console.log('File exists but no MD5 provided. Re-downloading:', fullOutputPath);
        }
    }

    console.log('Fetching:', outputPath);

    const { data, headers } = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const totalLength = parseInt(headers['content-length'], 10);

    console.log('Starting download');

    const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: totalLength
    });

    const dir = path.dirname(fullOutputPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(fullOutputPath);

    // Return a promise that resolves when the download is complete
    return new Promise<void>((resolve, reject) => {
        data.on('data', (chunk: any) => {
            progressBar.tick(chunk.length);
        });

        data.pipe(writer);

        writer.on('finish', () => {
            console.log('Download completed for:', outputPath);
            resolve();
        });

        writer.on('error', reject);
    });
}

async function getResourcesJSON(data: BasicResponse) {
    let url = data.default.cdnList[0].url + data.default.resources;
    const response = await axios.get<ResourceResponse>(url);
    return response.data;
}
async function getIndexJSON(url: string) {
    const response = await axios.get<BasicResponse>(url);
    return response.data;
}
function getLink(basic: BasicResponse, resource: ResourceResponse, index: number) {
    return {
        url: basic.default.cdnList[0].url + basic.default.resourcesBasePath + resource.resource[index].dest,
        md5: resource.resource[index].md5,
        path: resource.resource[index].dest
    };
}
async function fetchData(url: string) {
    let index = await getIndexJSON(url);
    let resource = await getResourcesJSON(index);
    for(let i = 0; i < resource.resource.length; i++) {
        let res = getLink(index, resource, i);
        await downloadResources(res.url,res.md5,res.path);
    }
}
const url = 'https://prod-cn-alicdn-gamestarter.kurogame.com/pcstarter/prod/game/G152/10008_Pa0Q0EMFxukjEqX33pF9Uyvdc8MaGPSz/index.json';
fetchData(url);
