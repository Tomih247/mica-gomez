const https = require('https');
const fs = require('fs');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' } };
    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (e) => { fs.unlink(dest, ()=>{}); reject(e); });
  });
}

const images = [
  // Profile photo - try higher res
  { url: 'https://instagram.faep9-2.fna.fbcdn.net/v/t51.2885-19/148261056_258444679138710_8359345324180505344_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDU5LmMyIn0&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gHX-wjToN_xHuQ3zqrNuFiX5r7mCTDMX-pwHFwVaW5XsbKog03c8gY65KOU0TiPI-s&_nc_ohc=oBWM7RXGyLEQ7kNvwFdjYwd&_nc_gid=eDbU-8UIzJNCzHLrRTcqEA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_Af9bsUBdBTYSO5XvpY7oDAzejr9NZVhXFR_bEy357TsjdQ&oe=6A2E2FE6&_nc_sid=8b3546', dest: 'assets/profile.jpg' },
  // Post thumbnails - professional looking posts
  { url: 'https://instagram.faep9-2.fna.fbcdn.net/v/t39.30808-6/405091584_18396676654016814_8561038806730485754_n.jpg?stp=dst-jpg_e15_s640x640_tt6&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gFQwKp3Xrz-Qe7klLItDkfwsYeG6a27HHTNSwmgVA1YzSGEEiDszD-GvKp4xtsNPIE&_nc_ohc=Y7cXpxYoTV8Q7kNvwFoWC0a&_nc_gid=3SsCdNmV2jFF00MYmuBpGg&edm=AGW0Xe4AAAAA&ccb=7-5&oh=00_Af8U4ahNv1p8zRCmIeimZFwPqd4MdR8JWK4mmSNJ9kT5Jg&oe=6A2E0B84&_nc_sid=94fea1', dest: 'assets/post1.jpg' },
  { url: 'https://instagram.faep9-2.fna.fbcdn.net/v/t39.30808-6/382979770_18384475318016814_6633650432578403993_n.jpg?stp=dst-jpg_e15_s640x640_tt6&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2gFQwKp3Xrz-Qe7klLItDkfwsYeG6a27HHTNSwmgVA1YzSGEEiDszD-GvKp4xtsNPIE&_nc_ohc=Meu00wRBb7cQ7kNvwHhw0EH&_nc_gid=3SsCdNmV2jFF00MYmuBpGg&edm=AGW0Xe4AAAAA&ccb=7-5&oh=00_Af-lO0IGhIKVaMiEuiGgXwv62DJyiSxh_xU7nUj70kbMwg&oe=6A2E3B79&_nc_sid=94fea1', dest: 'assets/post2.jpg' },
  { url: 'https://instagram.faep9-1.fna.fbcdn.net/v/t51.82787-15/570798499_18426311113107903_7969925501104641515_n.jpg?stp=dst-jpg_e15_s640x640_tt6&_nc_ht=instagram.faep9-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2gFQwKp3Xrz-Qe7klLItDkfwsYeG6a27HHTNSwmgVA1YzSGEEiDszD-GvKp4xtsNPIE&_nc_ohc=guYYMbVdqHAQ7kNvwFWAylA&_nc_gid=3SsCdNmV2jFF00MYmuBpGg&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_Af-QVJYLulPN_ydSalzMgCZueOLKXMq3svRdKHgQFZyoNg&oe=6A2E1480&_nc_sid=94fea1', dest: 'assets/post3.jpg' },
  { url: 'https://instagram.faep9-2.fna.fbcdn.net/v/t51.82787-15/558178808_18059023616431859_4003924842764497928_n.webp?stp=dst-jpg_e15_s640x640_tt6&_nc_ht=instagram.faep9-2.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2gFQwKp3Xrz-Qe7klLItDkfwsYeG6a27HHTNSwmgVA1YzSGEEiDszD-GvKp4xtsNPIE&_nc_ohc=Ab7bB41e1rkQ7kNvwG4s6ml&_nc_gid=3SsCdNmV2jFF00MYmuBpGg&edm=AGW0Xe4BAAAA&ccb=7-5&oh=00_Af_y7BtDuZ46nypEwxLMtVoRy4rDHDSARE9cg3ozLR9EUQ&oe=6A2E3A81&_nc_sid=94fea1', dest: 'assets/post4.jpg' },
];

async function downloadAll() {
  for (const img of images) {
    try {
      await downloadFile(img.url, img.dest);
      const size = fs.statSync(img.dest).size;
      console.log(`OK: ${img.dest} (${size} bytes)`);
    } catch(e) {
      console.log(`FAIL: ${img.dest} - ${e.message}`);
    }
  }
}

downloadAll();
