// 依赖引入
const jsdom = require('jsdom');
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const { JSDOM } = jsdom;

let pathArr = [];
let num = 0;
let pathArrLength = 0;

const readFile = async () => {
  return new Promise((resolve, reject) => {
    let pathArrStr = '';
    fs.readFile('download/path.json', 'utf-8', (err, data) => {
      pathArrStr = data;
      pathArr = JSON.parse(pathArrStr);
      // console.log("pathArr", pathArr);
      pathArrLength = pathArr.length;
      console.log('length:', pathArrLength);
      resolve();
    });
  });
};

const options = path => {
  return {
    host: 'xzsp.zjidb.com',
    port: 443,
    path: `/api/bicycle/${path}`,
  };
};

const req = p => {
  return new Promise((resolve, reject) => {
    const requestss = https.request(options(p), res => {
      if (res.statusCode === 200) {
        let buffArr = [];
        let buff = null;
        res.on('data', d => {
          buffArr.length += 1;
          buffArr[buffArr.length - 1] = d;
        });
        res.on('end', async () => {
          buffArr.length > 1 ? (buff = Buffer.concat(buffArr)) : (buff = buffArr[0]);
          let html = buff.toString();
          const dom = new JSDOM(html).window.document;
          const hlTitleArr = dom.querySelectorAll('.hl-title');
          // console.log("hlTitleArr", hlTitleArr[0].innerHTML);
          const valArr = dom.querySelectorAll('.val');
          let inputArr = [
            parseInt(p), // id int
            hlTitleArr[0].innerHTML, // brand text
            hlTitleArr[1].innerHTML, // model text
            parseInt(valArr[0].childNodes[0].data), // max_spd int
            parseInt(valArr[11].childNodes[0].data), // engine_power int
            valArr[3].innerHTML, // power_type text
            parseInt(valArr[7].childNodes[0].data), // power_cpct int
            parseInt(valArr[5].childNodes[0].data), // max_spd int
          ];
          // console.log('inputArr', inputArr);
          await insertData(inputArr);
          console.log(`nowPath: ${p}, nowNum: ${num}`);
          resolve();
        });
      } else {
        console.log('出啥情况啦？咱也不造啊|д`)');
      }
    });

    requestss.on('error', error => {
      console.error(error);
      reject(error);
    });
    requestss.end();
  });
};

const db = new sqlite3.Database('./download/bike.db', err => {
  if (err) {
    console.log(err);
  }
  console.log('数据库创建成功');
});

const createDB = () => {
  return new Promise((resolve, reject) => {
    db.run('CREATE TABLE bike_path(id integer, brand text, model text, max_spd integer, engine_power integer, power_type text, power_cpct integer, power_volt integer)', () => {
      resolve();
    });
  });
};

const insertData = async insertArr => {
  await createDB();
  db.run(`INSERT INTO bike_path(id, brand, model, max_spd, engine_power, power_type, power_cpct, power_volt) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, insertArr, err => {
    if (err) {
      console.log(err);
    }
    // console.log('数据插入成功');
  });
};

readFile().then(async () => {
  for (num = 0; num < pathArrLength - 1; num++) {
    await req(pathArr[num]);
  }
  // db.close(err => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log('数据库关闭');
  // });
});
