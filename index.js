import pdfreader from "pdfreader";
import fetch from 'node-fetch';

const year = "2020";
const urlPrefix = "https://efast2-filings-public.s3.amazonaws.com/prd";

let response = await fetch("https://www.efast.dol.gov/services/afs?q.parser=lucene&size=200&sort=planname%20asc&q=(((planname:microsoft)))&facet.planyear=%7Bsize:30%7D%26facet.plancode=%7Bsize:100%7D&facet.plancode=%7Bsize:100%7D&facet.assetseoy=%7Bbuckets:%5B%22%7B,100000%5D%22,%22%5B100001,500000%5D%22,%22%5B500001,1000000%5D%22,%22%5B1000001,10000000%5D%22,%22%5B10000001,%7D%22%5D%7D&facet.plantype=%7Bsize:20%7D&facet.businesscodecat=%7Bsize:30%7D&facet.businesscode=%7Bsize:30%7D&facet.state=%7Bsize:100%7D&facet.countrycode=%7Bbuckets:%5B%22CA%22,%22GB%22,%22BM%22,%22KY%22%5D%7D&facet.formyear=%7Bsize:30%7D", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,zh-HK;q=0.8,zh;q=0.7,ar;q=0.6,af;q=0.5",
    "cache-control": "no-cache",
    "newrelic": "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjIwMDc5MzkiLCJhcCI6IjEzNTk3NzA3NjMiLCJpZCI6IjAzYmY4ZTZmMjFmMDNjZmUiLCJ0ciI6IjI1MmQxZjE5MTcxMDFlZTBhMTYwNjBhN2YzYzYzZWYwIiwidGkiOjE2NDYzMzE3MDUyMTh9fQ==",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "traceparent": "00-252d1f1917101ee0a16060a7f3c63ef0-03bf8e6f21f03cfe-01",
    "tracestate": "2007939@nr=0-1-2007939-1359770763-03bf8e6f21f03cfe----1646331705218",
    "Referer": "https://www.efast.dol.gov/5500Search/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});
const json = await response.json();

console.log(`found ${json.hits.hit.length} records for microsoft`);
let len = json.hits.hit.length;
for(var i=0; i<len; ++i){
  let element = json.hits.hit[i];
  let fields = element.fields;
  if (fields.planyear == year) {
    let assetAmt = parseFloat(fields.assetseoy);
    if (assetAmt > 0) {
      console.log(`${fields.planname} ${fields.assetseoy} ${fields.ein} ${fields.participantsboy} ${fields.pdfpath}`);
      let urlToPdf = urlPrefix + fields.pdfpath;
      await getPDF(urlToPdf, result);
      break;
    }
  }
}

function result(err) {

}

async function getPDF(url, callback) {
  console.log(`getting PDF from ${url}`);

  let response = await fetch(url, {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,zh-HK;q=0.8,zh;q=0.7,ar;q=0.6,af;q=0.5",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Referer": "https://www.efast.dol.gov/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

  const buffer = await response.arrayBuffer();
  let reader = new pdfreader.PdfReader();
  reader.parseBuffer(buffer, function (err, item) {
    if (err) result(new Error('error'));
    else if (!item) result(null);
    else if (item.text) console.log(item.text);
  });
}