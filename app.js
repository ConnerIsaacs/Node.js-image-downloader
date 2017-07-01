//Uses request, url-parse, cheerio, download-image, async, promp-sync, node-xlsx
//takes a url, finds all the images on the website, gets all the best SEO keywrods from the given excel file, and renames the images to 
//seo-friendly names while they download
//@Written by Conner Isaacs

//initializes all npm's
var request = require('request');
var url = require('url-parse');
var cheerio = require('cheerio');
var download = require('download-image');
var async = require('async');
var prompt = require('prompt-sync')();
var xlsx = require('node-xlsx');
//Set needed variables
var page = prompt("Enter a URL: "); //get Site to get images from
var directory = prompt("Directory to download to: "); //get directory to download to
var Excel_File = prompt("Enter excel file: ");
var relativeLinks = [page];
var srcArray = [];
var count = 0;
var keywords = [];
var topTwenty = 1;
var pastTwenty = 21;
var city = prompt("City of company: ");
var state = prompt("State of company: ");
grabKeyWords(Excel_File);
request(page,(error,response,body)=>{
    if(error){
        console.log("Error here");
    }
    console.log("Getting links on the site..Please wait");
    var $ = cheerio.load(body);
    getRelativeLinks($);
    console.log("Links found! Getting sources...");
    getSources(relativeLinks);
})

//Get all relative links from the given url
function getRelativeLinks($){
    var Links = $("a[href^='/']");
    Links.each(function() {
        relativeLinks.push(page+$(this).attr('href').substring(1));
    });
}

//Obtains all image sources from each link given in the passed array
function getSources(array){
    for(var i = 0; i < relativeLinks.length;i++){
        var x = relativeLinks[i];
        request(relativeLinks[i],(error,response,body)=>{
            if(error){
                console.log("Error!");
            }
            if(response.statusCode === 200){
                count++;
                var $ = cheerio.load(body);
                var TextInBody =   $('img').each(function(i, element){
                var a = $(this).attr('src');
                if(a.charAt(0)==='/'){
                    srcArray.push(x+a);
                }
                else if(a.charAt(0)=='s'){}
                else{
                    srcArray.push(a);
                }
            });

            //If the completed amount of request equals the length of the array,
            //download the images in the source array
            if(count == relativeLinks.length-1){
                console.log("Sources found...Starting download");
                console.log(srcArray);
                srcArray = uniq(srcArray);
                dlImages(srcArray);
            }
            }
        })
    }
}

//Filters the duplicates from the array
function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

//Adds www. to each url in the passed array if it does not have it already
function addWWW(arr){
        for(var i = 0; i < arr.length;i++){
            if(arr[i].indexOf("www.")===-1){
                var x = arr[i].indexOf(":");
                arr[i] = arr[i].substring(0,x+2)+"www."+arr[i].substring(x+2);
            }
    }
}


//Function that downloads all the images in the source array
function dlImages(arr){
    for(var i = 0; i < arr.length;i++){
        download(arr[i],directory+'/'+keywords[topTwenty]+'-'+city+'-'+state+'-'+keywords[pastTwenty]+".jpg");
        topTwenty++;
        pastTwenty++;
        if(topTwenty==21){
            topTwenty =1;
        }
        if(pastTwenty == keywords.length){
            pastTwenty = 21;
        }
    }
}

//grabs keywords from excel file and replaces spaces with '-' character
function grabKeyWords(x){
    var obj = xlsx.parse('./'+x)[1].data; // parses a file 
for(var i = 0; i < obj.length;i++){
    if(obj[i][0]!=undefined){
        obj[i][0] = obj[i][0].replace(/[\s]/g,"-");
        keywords.push(obj[i][0]);
    }  
}
}



