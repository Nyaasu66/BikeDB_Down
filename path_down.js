// 依赖引入
const jsdom = require('jsdom');
const https = require('https');
const fs = require('fs');
const { JSDOM } = jsdom;

let page = 1;
let pathList = [];
const pageNum = 140;

console.log("pageNum: ", pageNum);

const options = page => {
  return {
    host: 'xzsp.zjidb.com',
    port: 443,
    path: `/api/bicycle?keyword=&page=${page}`,
  };
};

const idTurner = c => {
  return new Promise((resolve, reject) => {
    const req = https.request(options(c), res => {
      if (res.statusCode === 502) {
        console.log('被抓到啦');
      } else if (res.statusCode === 200) {
        // console.log(`状态码: ${res.statusCode}, 开始获取索引`);
        let buffArr = [];
        let buff = null;
        res.on('data', d => {
          buffArr.length += 1;
          buffArr[buffArr.length - 1] = d;
        });
        res.on('end', () => {
          buffArr.length > 1 ? (buff = Buffer.concat(buffArr)) : (buff = buffArr[0]);
          let html = buff.toString();
          const dom = new JSDOM(html);
          let idList = dom.window.document.querySelectorAll('tr a');
          idList.forEach(element => {
            pathList.push(element.href.slice(13));
          });
          console.log(`nowPage: ${c}, nowNum: ${pathList.length}`);
          resolve();
        });
      } else {
        console.log('出啥情况啦？咱也不造啊|д`)');
      }
    });

    req.on('error', error => {
      console.error(error);
      reject(error);
    });

    req.end();
  });
};

const pageTurner = page => {
  return new Promise(async (resolve, reject) => {
    for (let c = 1; c < page + 1; c++) {
      await idTurner(c);
    }
    resolve();
  });
};

const start = async () => {
  // 等待所有页轮询完成
  await pageTurner(pageNum);
  // 写入文件
  fs.mkdir('./download', { recursive: true }, err => {
    if (err) console.log(err);
  });
  let str = JSON.stringify(pathList);
  fs.writeFile(`./download/path.json`, str, function () {
    console.log(`下载完成！保存在 ./download/path.json`);
  });
};

start();